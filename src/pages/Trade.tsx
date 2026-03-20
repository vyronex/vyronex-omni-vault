import { useEffect, useRef, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { fetchCoinGeckoData } from "@/hooks/useCoinGecko";
import PageTransition from "@/components/PageTransition";

const Trade = () => {
  const [coins, setCoins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCoin, setCurrentCoin] = useState<any>(null);
  const [currentAction, setCurrentAction] = useState('Buy');
  const [currentSwapUrl, setCurrentSwapUrl] = useState('');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    loadTop50();
    const interval = setInterval(loadTop50, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadTop50() {
    try {
      const data = await fetchCoinGeckoData(
        "coins/markets",
        "vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false"
      );
      setCoins(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  async function openTradePanel(coingeckoId: string, action: 'buy' | 'sell') {
    setCurrentAction(action === 'buy' ? 'Buy' : 'Sell');
    setModalOpen(true);
    setIframeLoaded(false);

    try {
      const details = await fetchCoinGeckoData(`coins/${coingeckoId}`, "");
      setCurrentCoin(details);

      const platforms = details.platforms || {};
      let targetContract = null;
      let dex = 'binance';

      if (platforms['binance-smart-chain']) {
        targetContract = platforms['binance-smart-chain'];
        dex = 'pancakeswap';
      } else if (platforms['ethereum']) {
        targetContract = platforms['ethereum'];
        dex = 'uniswap';
      }

      let swapUrl = '';
      if (dex === 'pancakeswap' && targetContract) {
        swapUrl = `https://pancakeswap.finance/swap?outputCurrency=${encodeURIComponent(targetContract)}`;
      } else if (dex === 'uniswap' && targetContract) {
        swapUrl = `https://app.uniswap.org/#/swap?outputCurrency=${encodeURIComponent(targetContract)}`;
      } else {
        const s = details.symbol ? details.symbol.toUpperCase() : '';
        swapUrl = `https://www.binance.com/en/trade/${s}_USDT`;
      }

      setCurrentSwapUrl(swapUrl);
      setTimeout(() => { if (!iframeLoaded) setIframeLoaded(true); }, 2500);
    } catch (err) {
      console.error(err);
      setCurrentSwapUrl(`https://www.coingecko.com/en/coins/${coingeckoId}`);
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Page Header */}
      <section className="page-header">
        <div className="absolute inset-0 gradient-hero" />
        <div className="page-header-content">
          <div className="max-w-7xl mx-auto animate-slide-up">
            <span className="section-badge">DEX Trading</span>
            <h1 className="page-title">
              Live <span className="text-gradient">Trading</span>
            </h1>
            <p className="page-subtitle">
              Real prices via CoinGecko. Click Buy or Sell to open a real swap widget (PancakeSwap / Uniswap).
            </p>
          </div>
        </div>
      </section>

      <div className="section-container py-8">
        <div className="max-w-7xl mx-auto">

          {/* Trading Guide */}
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {[
              { step: "01", title: "Connect Wallet", desc: "Connect your wallet inside the DEX widget when you click Buy/Sell." },
              { step: "02", title: "Set Amount", desc: "Enter the amount you want to swap and review the transaction." },
              { step: "03", title: "Confirm Trade", desc: "Approve and confirm the transaction in your wallet." },
            ].map((item, i) => (
              <div key={i} className={`card-modern animate-slide-up stagger-${i + 1}`}>
                <div className="text-3xl font-bold text-primary/15 mb-2" style={{ fontFamily: "'Space Grotesk', system-ui" }}>{item.step}</div>
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-card border border-border/40 shadow-elevated overflow-hidden animate-slide-up stagger-4">
            <div className="overflow-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Price (USD)</th>
                    <th>24h</th>
                    <th className="hidden md:table-cell">Market Cap</th>
                    <th className="hidden lg:table-cell">Volume (24h)</th>
                    <th className="min-w-[160px]">Trade</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      <div className="h-6 w-6 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </td></tr>
                  ) : coins.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Failed to load data</td></tr>
                  ) : (
                    coins.map((c, i) => {
                      const pct = c.price_change_percentage_24h;
                      return (
                        <tr
                          key={c.id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${i * 20}ms`, animationFillMode: "both" }}
                        >
                          <td className="text-muted-foreground">{i + 1}</td>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <img src={c.image} alt={c.symbol} className="w-7 h-7 rounded-full" />
                              <div>
                                <strong className="text-sm">{c.name}</strong>
                                <span className="text-xs text-muted-foreground ml-1.5">({c.symbol.toUpperCase()})</span>
                              </div>
                            </div>
                          </td>
                          <td className="font-mono text-sm">${Number(c.current_price).toLocaleString()}</td>
                          <td>
                            <span className={`text-sm font-semibold ${pct >= 0 ? 'text-[hsl(var(--vnx-green))]' : 'text-[hsl(var(--vnx-red))]'}`}>
                              {pct ? pct.toFixed(2) + '%' : '—'}
                            </span>
                          </td>
                          <td className="hidden md:table-cell text-muted-foreground text-sm">${Number(c.market_cap || 0).toLocaleString()}</td>
                          <td className="hidden lg:table-cell text-muted-foreground text-sm">${Number(c.total_volume || 0).toLocaleString()}</td>
                          <td>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => openTradePanel(c.id, 'buy')}
                                className="rounded-lg gradient-primary active-press text-xs px-4 shadow-glow hover:shadow-glow-lg transition-all"
                              >
                                Buy
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openTradePanel(c.id, 'sell')}
                                className="rounded-lg active-press text-xs px-4 hover-border-glow"
                              >
                                Sell
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md z-50 animate-fade-in">
          <div className="w-[920px] max-w-[96%] h-[80vh] bg-card rounded-2xl overflow-hidden flex flex-col border border-border/40 shadow-elevated">
            <div className="flex items-center justify-between px-5 py-4 bg-card border-b border-border/40">
              <div className="flex gap-3 items-center">
                {currentCoin && (
                  <>
                    <img src={currentCoin.image?.large || currentCoin.image?.thumb} alt="" className="w-7 h-7 rounded-full" />
                    <div>
                      <div className="font-bold text-sm">{currentCoin.name} ({currentCoin.symbol?.toUpperCase()})</div>
                      <div className="text-xs text-muted-foreground">
                        Current price: ${currentCoin.market_data?.current_price?.usd ? Number(currentCoin.market_data.current_price.usd).toLocaleString() : '—'}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-muted-foreground hidden md:inline">
                  {iframeLoaded ? 'Widget loaded — connect your wallet inside the widget.' : 'Loading widget…'}
                </span>
                <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} className="rounded-xl active-press">Close</Button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="flex-[0_0_320px] p-5 border-r border-border/40 overflow-y-auto">
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Action</p>
                  <p className="font-bold text-lg">{currentAction}</p>
                </div>
                <div className="mb-4">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">From (wallet token)</label>
                  <select className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-background border border-border/40 text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all">
                    <option value="0x0000000000000000000000000000000000000000">Native (BNB / ETH)</option>
                    <option value="0x55d398326f99059ff775485246999027b3197955">USDT (BEP20)</option>
                    <option value="0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d">USDC (BEP20)</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Slippage tolerance</label>
                  <div className="flex gap-2 mt-1.5 items-center">
                    <input type="number" defaultValue="1" min="0" step="0.1" className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/40 text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all" />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="mt-5 flex flex-col gap-2">
                  <Button onClick={() => currentSwapUrl && window.open(currentSwapUrl, '_blank')} className="rounded-xl gradient-primary shadow-glow active-press">Open in new tab</Button>
                  <Button variant="outline" onClick={() => setModalOpen(false)} className="rounded-xl active-press">Close</Button>
                </div>
                <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                  This embeds public DEX swap pages. Wallet connect & signing happen inside the DEX widget. If embedding is blocked, use Open in new tab.
                </p>
              </div>

              <div className="flex-1">
                <iframe
                  ref={iframeRef}
                  src={currentSwapUrl}
                  title="Swap widget"
                  className="w-full h-full border-0"
                  sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
                  onLoad={() => setIframeLoaded(true)}
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-muted/20 flex items-center gap-3 border-t border-border/40">
              <span className="text-xs text-muted-foreground flex-1">
                If swap widget fails to load, click Open in new tab.
              </span>
              <Button size="sm" onClick={() => currentSwapUrl && window.open(currentSwapUrl, '_blank')} className="rounded-lg active-press gradient-primary">Open in new tab</Button>
              <Button size="sm" variant="outline" onClick={() => setModalOpen(false)} className="rounded-lg active-press">Close</Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Trade;
