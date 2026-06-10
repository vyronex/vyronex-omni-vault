// Generates real, valid blockchain addresses for each chain a user has.
// Replaces any wallet whose address starts with "pending" with a freshly
// generated address. Each chain gets its own unique keypair.
//
// NOTE: This is a deposit-address provisioner. Private material is NOT
// persisted in this version — addresses are observation-only. Do not send
// real funds until a custody integration is added.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { secp256k1 } from "https://esm.sh/@noble/curves@1.4.0/secp256k1";
import { ed25519 } from "https://esm.sh/@noble/curves@1.4.0/ed25519";
import { sha256 } from "https://esm.sh/@noble/hashes@1.4.0/sha256";
import { ripemd160 } from "https://esm.sh/@noble/hashes@1.4.0/ripemd160";
import { keccak_256 } from "https://esm.sh/@noble/hashes@1.4.0/sha3";
import { base58, base58check } from "https://esm.sh/@scure/base@1.1.6";

const toHex = (b: Uint8Array) =>
  Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");

function evmAddress(): string {
  const pk = secp256k1.utils.randomPrivateKey();
  const pub = secp256k1.getPublicKey(pk, false).slice(1); // uncompressed, drop 0x04
  const hash = keccak_256(pub);
  const addr = hash.slice(-20);
  // EIP-55 checksum
  const hex = toHex(addr);
  const hashHex = toHex(keccak_256(new TextEncoder().encode(hex)));
  let out = "0x";
  for (let i = 0; i < hex.length; i++) {
    out += parseInt(hashHex[i], 16) >= 8 ? hex[i].toUpperCase() : hex[i];
  }
  return out;
}

function btcAddress(): string {
  const pk = secp256k1.utils.randomPrivateKey();
  const pub = secp256k1.getPublicKey(pk, true); // compressed (33 bytes)
  const h160 = ripemd160(sha256(pub));
  // P2PKH mainnet (0x00 prefix) → base58check → starts with "1"
  const payload = new Uint8Array(21);
  payload[0] = 0x00;
  payload.set(h160, 1);
  return base58check(sha256).encode(payload);
}

function solAddress(): string {
  const pk = ed25519.utils.randomPrivateKey();
  const pub = ed25519.getPublicKey(pk); // 32 bytes
  return base58.encode(pub);
}

function tronAddress(): string {
  const pk = secp256k1.utils.randomPrivateKey();
  const pub = secp256k1.getPublicKey(pk, false).slice(1);
  const hash = keccak_256(pub);
  const addr20 = hash.slice(-20);
  const payload = new Uint8Array(21);
  payload[0] = 0x41; // Tron mainnet
  payload.set(addr20, 1);
  return base58check(sha256).encode(payload);
}

function generateForChain(chain: string): string | null {
  switch (chain) {
    case "BNB Chain":
    case "Ethereum":
    case "Fantom":
      return evmAddress();
    case "Bitcoin":
      return btcAddress();
    case "Solana":
      return solAddress();
    case "Tron":
      return tronAddress();
    default:
      return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const force: boolean = !!body.force;

    const { data: wallets, error: wErr } = await admin
      .from("wallets")
      .select("id, chain, address")
      .eq("user_id", user.id);
    if (wErr) throw wErr;

    const updates: { id: string; chain: string; address: string }[] = [];
    for (const w of wallets ?? []) {
      const needsProvision = force || (w.address?.startsWith("pending") ?? true);
      if (!needsProvision) continue;
      const addr = generateForChain(w.chain);
      if (!addr) continue;
      const { error: upErr } = await admin
        .from("wallets")
        .update({ address: addr })
        .eq("id", w.id);
      if (upErr) throw upErr;
      updates.push({ id: w.id, chain: w.chain, address: addr });
    }

    return new Response(JSON.stringify({ provisioned: updates }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
