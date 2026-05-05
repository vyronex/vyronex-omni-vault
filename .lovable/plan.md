
# Rebrand Homepage as Centralized Exchange + Add New Sections

The homepage currently presents VyronexVNX as a decentralized protocol (DEX, self-custody, permissionless finance). Since this is a **centralized exchange**, the messaging, features, and new sections need to reflect that.

---

## Part 1: Update Existing Content to CEX Identity

Throughout `src/pages/Index.tsx`, update copy and framing:

- **Hero**: Change "Multi-Chain DeFi Protocol" badge to "Centralized Crypto Exchange". Update tagline from "permissionless finance" to "institutional-grade trading infrastructure."
- **Bento Features**: Replace "Self-Custody" with "Custodial Wallets". Replace "DeFi Suite" with "Trading Suite". Update descriptions to reflect managed custody, not self-custody.
- **Comparison Table**: Flip the "Self-Custody" row — VyronexVNX = "Managed" (advantage: insured), update framing so CEX features are the selling point.
- **Earning Section**: Rename from DeFi strategies to "Earn Programs" (CEX-managed staking/savings).
- **Quick Swap**: Reframe as "Instant Convert" — a CEX feature for simple token swaps without orderbook.
- **Governance**: Keep but frame as "Community Voice" rather than on-chain DAO.

## Part 2: Add 6 New Sections

### 1. Matching Engine & Order Types (after Bento Features)
Showcase the CEX core: ultra-low-latency matching engine, order types (Limit, Market, Stop-Loss, OCO, Trailing Stop, Iceberg), and throughput stats (100K TPS, <1ms matching).

### 2. Institutional & OTC Desk (after Developer API)
Dedicated section for institutional clients: OTC trading for large blocks, dedicated account managers, custom API limits, prime brokerage, and white-glove onboarding.

### 3. Fiat Gateway (after Quick Swap / Instant Convert)
Highlight fiat on/off-ramp: supported currencies (USD, EUR, GBP, etc.), payment methods (bank transfer, credit/debit card, Apple Pay), instant deposits, and regulated fiat partners.

### 4. Copy Trading & Leaderboard (after Earning section)
Social trading feature: follow top traders, auto-copy strategies, performance leaderboard with win rates and ROI, and profit-sharing model.

### 5. Security & Compliance Deep-Dive (replace/enhance existing Security section)
Expanded version: SOC 2 Type II, multi-sig cold storage architecture, proof-of-reserves, real-time fraud detection, regulatory licenses held, and bug bounty program ($250K pool).

### 6. 24/7 Support Center (before FAQ)
Dedicated support section: live chat, ticket system, VIP support tiers, average response times, knowledge base stats, and multi-language support team.

---

## Technical Details

- All changes in `src/pages/Index.tsx` only
- No new dependencies, hooks, or database changes
- Follows existing patterns: `section-badge`, `text-gradient`, Space Grotesk headings, rounded-3xl cards, `hover-border-glow`
- Framer Motion animations reused from existing sections
- Responsive grid layouts consistent with current design
- No icons (text-based badges per project constraints)
