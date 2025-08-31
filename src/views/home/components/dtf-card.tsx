import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronDown, ArrowUpDown, ArrowRight } from 'lucide-react'

export default function DTFCard() {
  return (
    <div className=" bg-gray-50 p-4 rounded-4xl">
      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6">
        {/* Left Trading Card - narrower column */}
        <div className="col-span-3">
          <Card className="p-0 overflow-hidden bg-white rounded-[24px] shadow-sm border-0">
            <div className="relative bg-gradient-to-br from-[#4F46E5] via-[#3730A3] to-[#312E81] p-6 h-[320px]">
              {/* Corner decorative dots - more subtle */}
              <div className="absolute top-3 left-3 grid grid-cols-2 gap-[2px]">
                <div className="w-[3px] h-[3px] bg-white/20 rounded-full"></div>
                <div className="w-[3px] h-[3px] bg-white/20 rounded-full"></div>
                <div className="w-[3px] h-[3px] bg-white/20 rounded-full"></div>
                <div className="w-[3px] h-[3px] bg-white/20 rounded-full"></div>
              </div>
              <div className="absolute top-3 right-3 grid grid-cols-2 gap-[2px]">
                <div className="w-[3px] h-[3px] bg-white/20 rounded-full"></div>
                <div className="w-[3px] h-[3px] bg-white/20 rounded-full"></div>
                <div className="w-[3px] h-[3px] bg-white/20 rounded-full"></div>
                <div className="w-[3px] h-[3px] bg-white/20 rounded-full"></div>
              </div>
              <div className="absolute bottom-3 left-3 grid grid-cols-2 gap-[2px]">
                <div className="w-[3px] h-[3px] bg-white/20 rounded-full"></div>
                <div className="w-[3px] h-[3px] bg-white/20 rounded-full"></div>
                <div className="w-[3px] h-[3px] bg-white/20 rounded-full"></div>
                <div className="w-[3px] h-[3px] bg-white/20 rounded-full"></div>
              </div>
              <div className="absolute bottom-3 right-3 grid grid-cols-2 gap-[2px]">
                <div className="w-[3px] h-[3px] bg-white/20 rounded-full"></div>
                <div className="w-[3px] h-[3px] bg-white/20 rounded-full"></div>
                <div className="w-[3px] h-[3px] bg-white/20 rounded-full"></div>
                <div className="w-[3px] h-[3px] bg-white/20 rounded-full"></div>
              </div>

              {/* Page indicator - more accurate styling */}
              <div className="flex justify-center mb-6">
                <div className="bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
                  <div className="w-4 h-3 bg-white/90 rounded-[3px] flex items-center justify-center">
                    <div className="w-2 h-1.5 bg-[#4F46E5] rounded-[2px]"></div>
                  </div>
                  <span className="text-white text-sm font-medium">2 / 20</span>
                </div>
              </div>

              {/* Enhanced circular chart with concentric rings and curve */}
              <div className="flex justify-center items-center h-40">
                <div className="relative w-36 h-36">
                  {/* Outer concentric rings */}
                  <div className="absolute inset-0 rounded-full border border-white/10"></div>
                  <div className="absolute inset-2 rounded-full border border-white/15"></div>
                  <div className="absolute inset-4 rounded-full border border-white/20"></div>

                  {/* Central logo circle */}
                  <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center shadow-lg">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        className="text-[#4F46E5]"
                      >
                        <path
                          d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Curved line overlay */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 144 144"
                  >
                    <path
                      d="M 30 100 Q 50 80 72 75 T 114 65"
                      stroke="white"
                      strokeWidth="1.5"
                      fill="none"
                      opacity="0.6"
                    />
                    <circle cx="114" cy="65" r="2" fill="white" opacity="0.8" />
                  </svg>

                  {/* Scattered ambient dots */}
                  <div className="absolute top-4 left-12 w-1 h-1 bg-white/40 rounded-full"></div>
                  <div className="absolute top-12 right-4 w-1 h-1 bg-white/40 rounded-full"></div>
                  <div className="absolute bottom-4 left-6 w-1 h-1 bg-white/40 rounded-full"></div>
                  <div className="absolute bottom-12 right-12 w-1 h-1 bg-white/40 rounded-full"></div>
                  <div className="absolute top-8 left-4 w-0.5 h-0.5 bg-white/30 rounded-full"></div>
                  <div className="absolute bottom-8 right-6 w-0.5 h-0.5 bg-white/30 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Trading inputs with precise spacing */}
            <div className="p-6 space-y-5">
              <div>
                <div className="text-[#6366F1] text-sm font-medium mb-2">
                  You use:
                </div>
                <div className="text-[32px] font-bold text-gray-900 mb-1 leading-none">
                  0.00
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-500 text-sm">$0.00</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      Balance:{' '}
                      <span className="font-semibold text-gray-900">100K</span>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs px-3 py-1 h-7 bg-transparent border-gray-200 hover:bg-gray-50"
                    >
                      Max
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#3B82F6] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">$</span>
                  </div>
                  <span className="font-medium text-gray-900">USDC</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="flex justify-center py-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <ArrowUpDown className="w-4 h-4 text-gray-400" />
                </Button>
              </div>

              <div>
                <div className="text-gray-600 text-sm font-medium mb-2">
                  You receive:
                </div>
                <div className="text-[32px] font-bold text-gray-900 mb-1 leading-none">
                  0.00
                </div>
                <div className="text-gray-500 text-sm mb-3">$0.00</div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#4F46E5] rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">
                      CMC20
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">CMC20</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <Button className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-3 rounded-xl font-medium text-base">
                Buy CMC20
              </Button>
            </div>
          </Card>
        </div>

        {/* Center Content - wider column */}
        <div className="col-span-5 space-y-6">
          <div>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-[#4F46E5] rounded-full flex items-center justify-center mt-1">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="text-white"
                >
                  <circle cx="12" cy="12" r="8" fill="currentColor" />
                  <circle cx="12" cy="12" r="4" fill="white" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-[28px] font-bold text-gray-900 leading-tight">
                    Coinmarketcap Top 20 Index
                  </h1>
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    🏷️ Majors, Bitcoin, Memes
                  </div>
                </div>
                <div className="text-[36px] font-bold text-gray-900 mb-1">
                  $140.13
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#10B981] font-semibold">
                    +6.23% (+$8.22)
                  </span>
                  <span className="text-gray-500">Past week</span>
                </div>
              </div>
            </div>

            {/* Enhanced chart area */}
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <div className="h-48 flex items-end justify-center relative mb-4">
                <svg className="w-full h-full" viewBox="0 0 500 180">
                  <defs>
                    <linearGradient
                      id="chartGradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#6B7280" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#6B7280" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 30 140 L 60 135 L 90 130 L 120 125 L 150 115 L 180 110 L 210 105 L 240 95 L 270 90 L 300 85 L 330 75 L 360 70 L 390 65 L 420 55 L 450 45"
                    stroke="#6B7280"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M 30 140 L 60 135 L 90 130 L 120 125 L 150 115 L 180 110 L 210 105 L 240 95 L 270 90 L 300 85 L 330 75 L 360 70 L 390 65 L 420 55 L 450 45 L 450 180 L 30 180 Z"
                    fill="url(#chartGradient)"
                  />
                  <circle cx="450" cy="45" r="4" fill="#1F2937" />
                </svg>
              </div>

              <div className="flex items-center justify-center gap-8">
                <button className="text-gray-400 text-sm hover:text-gray-600">
                  1d
                </button>
                <button className="text-[#4F46E5] text-sm font-semibold bg-[#4F46E5]/10 px-3 py-1 rounded-full">
                  1w
                </button>
                <button className="text-gray-400 text-sm hover:text-gray-600">
                  1m
                </button>
                <button className="text-gray-400 text-sm hover:text-gray-600">
                  3m
                </button>
                <button className="text-gray-400 text-sm hover:text-gray-600">
                  All
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8 py-4 border-b border-gray-100">
              <span className="text-gray-600 text-lg">Market cap</span>
              <span className="text-2xl font-bold text-gray-900">$543K.34</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About CMC20
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6 text-base">
                Built by the world's most trusted cryptocurrency data authority,
                the CMC20 provides the most unbiased, transparent, and
                data-driven way to track the performance of crypto markets.
              </p>
              <button className="flex items-center gap-2 text-[#4F46E5] font-semibold hover:text-[#4338CA]">
                <span>Learn more about CMC20</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - precise composition list */}
        <div className="col-span-4">
          <Card className="p-6 bg-white rounded-2xl shadow-sm border-0">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              What's in the CMC20 Index?
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#F59E0B] rounded-full"></div>
                  <span className="font-medium text-gray-900">
                    Bitcoin (BTC)
                  </span>
                </div>
                <span className="font-bold text-gray-900">70.75%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#3B82F6] rounded-full"></div>
                  <span className="font-medium text-gray-900">
                    Ethereum (ETH)
                  </span>
                </div>
                <span className="font-bold text-gray-900">10.71%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#14B8A6] rounded-full"></div>
                  <span className="font-medium text-gray-900">XRP (XRP)</span>
                </div>
                <span className="font-bold text-gray-900">4.48%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#EAB308] rounded-full"></div>
                  <span className="font-medium text-gray-900">BNB (BNB)</span>
                </div>
                <span className="font-bold text-gray-900">3.19%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#8B5CF6] rounded-full"></div>
                  <span className="font-medium text-gray-900">
                    Solana (SOL)
                  </span>
                </div>
                <span className="font-bold text-gray-900">2.94%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#CA8A04] rounded-full"></div>
                  <span className="font-medium text-gray-900">
                    Dogecoin (DOGE)
                  </span>
                </div>
                <span className="font-bold text-gray-900">1.10%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#2563EB] rounded-full"></div>
                  <span className="font-medium text-gray-900">TRON (TRX)</span>
                </div>
                <span className="font-bold text-gray-900">0.88%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#EC4899] rounded-full"></div>
                  <span className="font-medium text-gray-900">XRP (XRP)</span>
                </div>
                <span className="font-bold text-gray-900">4.48%</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white">
                    <span className="text-xs font-bold text-gray-600">+12</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    +12 other assets
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">5.95%</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
