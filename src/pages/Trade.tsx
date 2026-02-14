import { useEffect, useRef, useState } from "react";
import Navigation from "@/components/Navigation";
import { fetchCoinGeckoData } from "@/hooks/useCoinGecko";

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

      setTimeout(() => {
        if (!iframeLoaded) {
          setIframeLoaded(true);
        }
      }, 2500);
    } catch (err) {
      console.error(err);
      setCurrentSwapUrl(`https://www.coingecko.com/en/coins/${coingeckoId}`);
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-3">Top 50 Cryptocurrencies — Live prices & real Buy / Sell (DEX)</h1>
        <p className="text-sm text-gray-600 mb-4">
          Prices via CoinGecko. Click <strong>Buy</strong> or <strong>Sell</strong> to open a real swap widget (PancakeSwap / Uniswap). 
          If widget is blocked from embedding, use <em>Open in new tab</em>.
        </p>

        {/* Trading Guide */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-bold mb-2">1. Connect Wallet</h3>
            <p className="text-sm text-gray-600">Connect your wallet inside the DEX widget when you click Buy/Sell.</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-bold mb-2">2. Set Amount</h3>
            <p className="text-sm text-gray-600">Enter the amount you want to swap and review the transaction.</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-bold mb-2">3. Confirm Trade</h3>
            <p className="text-sm text-gray-600">Approve and confirm the transaction in your wallet.</p>
          </div>
        </div>

        <div className="overflow-auto bg-white rounded-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="sticky top-0 bg-gray-50 px-4 py-3 text-left font-semibold text-sm">#</th>
                <th className="sticky top-0 bg-gray-50 px-4 py-3 text-left font-semibold text-sm">Name</th>
                <th className="sticky top-0 bg-gray-50 px-4 py-3 text-left font-semibold text-sm">Price (USD)</th>
                <th className="sticky top-0 bg-gray-50 px-4 py-3 text-left font-semibold text-sm">24h</th>
                <th className="sticky top-0 bg-gray-50 px-4 py-3 text-left font-semibold text-sm">Market Cap</th>
                <th className="sticky top-0 bg-gray-50 px-4 py-3 text-left font-semibold text-sm">Volume (24h)</th>
                <th className="sticky top-0 bg-gray-50 px-4 py-3 text-left font-semibold text-sm min-w-[160px]">Trade</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : coins.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Failed to load data</td></tr>
              ) : (
                coins.map((c, i) => {
                  const pct = c.price_change_percentage_24h;
                  const pctClass = pct >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';
                  return (
                    <tr key={c.id} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                      <td className="px-4 py-3 border-b border-gray-100">{i + 1}</td>
                      <td className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <img src={c.image} alt={c.symbol} className="w-6 h-6 rounded-full" />
                          <strong>{c.name}</strong>
                          <span className="text-sm text-gray-500">({c.symbol.toUpperCase()})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-100">${Number(c.current_price).toLocaleString()}</td>
                      <td className="px-4 py-3 border-b border-gray-100">
                        <span className={pctClass}>{pct ? pct.toFixed(2) + '%' : '—'}</span>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-100">${Number(c.market_cap || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 border-b border-gray-100">${Number(c.total_volume || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 border-b border-gray-100">
                        <button 
                          onClick={() => openTradePanel(c.id, 'buy')}
                          className="px-3 py-1.5 rounded-md bg-green-600 text-white font-semibold text-sm hover:bg-green-700"
                        >
                          Buy
                        </button>
                        <button 
                          onClick={() => openTradePanel(c.id, 'sell')}
                          className="px-3 py-1.5 rounded-md bg-red-600 text-white font-semibold text-sm hover:bg-red-700 ml-2"
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="w-[920px] max-w-[96%] h-[80vh] bg-white rounded-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex gap-3 items-center">
                {currentCoin && (
                  <>
                    <img src={currentCoin.image?.large || currentCoin.image?.thumb} alt="" className="w-6 h-6 rounded-full" />
                    <div>
                      <div className="font-bold">{currentCoin.name} ({currentCoin.symbol?.toUpperCase()})</div>
                      <div className="text-sm text-gray-600">
                        Current price: ${currentCoin.market_data?.current_price?.usd ? Number(currentCoin.market_data.current_price.usd).toLocaleString() : '—'}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <div className="text-sm text-gray-600">
                  {iframeLoaded ? 'Widget loaded — connect your wallet inside the widget.' : 'Loading widget…'}
                </div>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex flex-1">
              <div className="flex-[0_0_360px] p-4 border-r border-gray-200">
                <div className="mb-3">
                  <strong>Selected action:</strong> <span>{currentAction}</span>
                </div>

                <div className="mb-3">
                  <label className="text-sm text-gray-600">From (wallet token)</label>
                  <select className="w-full mt-1.5 px-3 py-2 rounded-md bg-white text-gray-900 border border-gray-300">
                    <option value="0x0000000000000000000000000000000000000000">Native (BNB / ETH)</option>
                    <option value="0x55d398326f99059ff775485246999027b3197955">USDT (BEP20)</option>
                    <option value="0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d">USDC (BEP20)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="text-sm text-gray-600">Slippage tolerance</label>
                  <div className="flex gap-2 mt-1.5">
                    <input 
                      type="number" 
                      defaultValue="1" 
                      min="0" 
                      step="0.1"
                      className="w-full px-3 py-2 rounded-md bg-white text-gray-900 border border-gray-300"
                    />
                    <div className="text-sm text-gray-600 self-center">%</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => currentSwapUrl && window.open(currentSwapUrl, '_blank')}
                    className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Open in new tab
                  </button>
                  <button 
                    onClick={() => setModalOpen(false)}
                    className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  Note: This page embeds public DEX swap pages (PancakeSwap / Uniswap). Wallet connect & signing happen inside the DEX widget. 
                  If embedding is blocked by the DEX, use <strong>Open in new tab</strong>.
                </div>
              </div>

              <div className="flex-1 border-l border-gray-200">
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

            <div className="px-4 py-2.5 bg-gray-900/5 flex items-center gap-2">
              <div className="text-sm text-gray-600 flex-1">
                If swap widget fails to load, clicking <strong>Open in new tab</strong> will open the correct swap URL.
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => currentSwapUrl && window.open(currentSwapUrl, '_blank')}
                  className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Open in new tab
                </button>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trade;
