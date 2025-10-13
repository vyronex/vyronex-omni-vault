import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Swap = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Swap Tokens</h1>
            <p className="text-muted-foreground">Trade tokens instantly across multiple chains</p>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Token Swap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full max-w-md mx-auto bg-muted/20 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground text-center px-4">
                  Thirdweb Swap Widget will be integrated here.
                  <br />
                  <span className="text-sm">
                    Requires Thirdweb client initialization with clientId
                  </span>
                </p>
              </div>
              
              <div className="mt-6 p-4 rounded-lg bg-muted/20 border border-border">
                <h3 className="font-semibold mb-2">Quick Swap Info</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Swap VNX on BNB Chain (Chain ID: 56)</li>
                  <li>• VNX Contract: 0xeb55a55c384095ced21587afbe7418b7c9ae40cb</li>
                  <li>• Powered by PancakeSwap liquidity</li>
                  <li>• Low fees and instant settlement</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <a 
              href="https://pancakeswap.finance/swap?outputCurrency=0xeb55a55c384095ced21587afbe7418b7c9ae40cb" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 rounded-lg border border-border hover:border-primary transition-smooth text-center"
            >
              <h3 className="font-semibold mb-1">PancakeSwap</h3>
              <p className="text-sm text-muted-foreground">Trade on DEX</p>
            </a>
            <a 
              href="https://apespace.io/bsc/0xeb55a55c384095ced21587afbe7418b7c9ae40cb" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 rounded-lg border border-border hover:border-primary transition-smooth text-center"
            >
              <h3 className="font-semibold mb-1">ApeSpace</h3>
              <p className="text-sm text-muted-foreground">Analytics & Trade</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap;
