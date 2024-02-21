export default {
  collaterals: [
    {
      symbol: "cUSDC-VAULT",
      chain: 1,
      project: "COMP",
      color: "#2775CA",
      logo: "svgs/cusdc.svg",
      tokenDistribution: [{ token: "USDC", distribution: 1 }]
    },
    {
      symbol: "cUSDT-VAULT",
      chain: 1,
      project: "COMP",
      color: "#53AE94",
      logo: "svgs/cusdt.svg",
      tokenDistribution: [{ token: "USDT", distribution: 1 }]
    },
    {
      symbol: "saUSDC",
      chain: 1,
      project: "AAVE",
      color: "#2775CA",
      logo: "svgs/sausdc.svg",
      tokenDistribution: [{ token: "USDC", distribution: 1 }]
    },
    {
      symbol: "saUSDT",
      chain: 1,
      project: "AAVE",
      color: "#53AE94",
      logo: "svgs/sausdt.svg",
      tokenDistribution: [{ token: "USDT", distribution: 1 }]
    },
    {
      symbol: "wstETH",
      chain: 1,
      project: "LDO",
      color: "#627EEA",
      logo: "svgs/wsteth.svg",
      tokenDistribution: [{ token: "ETH", distribution: 1 }]
    },
    {
      symbol: "rETH",
      chain: 1,
      project: "RPL",
      color: "#627EEA",
      logo: "svgs/reth.svg",
      tokenDistribution: [{ token: "ETH", distribution: 1 }]
    },
    {
      symbol: "stkcvxeUSD3CRV-f",
      chain: 1,
      project: "CONVEX",
      color: `url(#stkcvxeusd3crv-f)`,
      logo: "svgs/stkcvxeusd3crv-f.svg",
      tokenDistribution: [
        {
          token: "eUSD",
          distribution: 0.5
        },{
          token: "FRAX",
          distribution: 0.25
        },{
          token: "USDC",
          distribution: 0.25
        },
      ]
    },
    {
      symbol: "mrp-aUSDT",
      chain: 1,
      project: "MORPHO",
      color: "#53AE94",
      logo: "svgs/mrp-ausdt.svg",
      tokenDistribution: [{ token: "USDT", distribution: 1 }]
    },
    {
      symbol: "sDAI",
      chain: 1,
      project: "SDR",
      color: "#EAAF50",
      logo: "svgs/sdai.svg",
      tokenDistribution: [{ token: "DAI", distribution: 1 }]
    },
    {
      symbol: "fUSDC",
      chain: 1,
      project: "FLUX",
      color: "#2C2C2C",
      logo: "svgs/fusdc.svg",
      tokenDistribution: [{ token: "USDC", distribution: 1 }]
    },
    {
      symbol: "wcUSDCv3",
      chain: 1,
      project: "COMPv3",
      color: "#2775CA",
      logo: "svgs/cusdcv3.svg",
      tokenDistribution: [{ token: "USDC", distribution: 1 }]
    },
    {
      symbol: "mrp-aUSDC",
      chain: 1,
      project: "MORPHO",
      color: "#2775CA",
      logo: "svgs/mrp-ausdc.svg",
      tokenDistribution: [{ token: "USDC", distribution: 1 }]
    },
    {
      symbol: "wcUSDCv3",
      chain: 8453,
      project: "COMPv3",
      color: "#2775CA",
      logo: "svgs/cusdcv3.svg",
      tokenDistribution: [{ token: "USDC", distribution: 1 }]
    },
    {
      symbol: "wsgUSDbC",
      chain: 8453,
      project: "STARGATE",
      color: "#999999",
      logo: "svgs/usdc.svg",
      tokenDistribution: [{ token: "USDC", distribution: 1 }]
    },
    {
      symbol: "saBasUSDbC",
      chain: 8453,
      project: "AAVE",
      color: "#2775CA",
      logo: "svgs/sausdc.svg",
      tokenDistribution: [{ token: "USDC", distribution: 1 }]
    },

    {
      symbol: 'wstETH',
      chain: 8453,
      project: 'LDO',
      color: '#627EEA',
      logo: 'svgs/wsteth.svg',
      tokenDistribution: [{ token: 'ETH', distribution: 1 }],
    },
    {
      symbol: 'cbETH',
      chain: 8453,
      project: 'COINBASE',
      color: '#0052ff',
      logo: 'svgs/cbeth.svg',
      tokenDistribution: [{ token: 'ETH', distribution: 1 }],
    },
  ],
  projects: [
    {
      name: "AAVE",
      label: "AAVE V2",
      color: "#a75ca3",
      logo: "svgs/aave.svg"
    },
    {
      name: "COMP",
      label: "Compound V2",
      color: "#39c7b1",
      logo: "svgs/comp.svg"
    },
    {
      name: "COMPv3",
      label: "Compound V3",
      color: "#39c7b1",
      logo: "svgs/comp.svg"
    },
    {
      name: "CONVEX",
      label: "Curve Convex LP",
      color: "#16280B",
      logo: "svgs/convex.svg"
    },
    {
      name: "GENERIC",
      label: "Generic",
      color: "#CCCCCC"
    },
    {
      name: "MORPHO",
      label: "Morpho (AAVE)",
      color: "#0059FF",
      logo: "svgs/morpho.svg"
    },
    {
      name: "SDR",
      label: "Savings DAI",
      color: "#7AC028",
      logo: "svgs/sdai.svg"
    },
    {
      name: "STARGATE",
      label: "Stargate",
      color: "#666666",
      logo: "svgs/stargate.svg"
    },
    {
      name: "LDO",
      label: "Lido",
      color: "#00A3FF",
      logo: "svgs/lido.svg"
    },
    {
      name: "RPL",
      label: "Rocket Pool",
      color: "#FFD27E",
      logo: "svgs/rpl.svg"
    },
    {
      name: "FLUX",
      label: "Flux",
      color: "#000000",
      logo: "svgs/flux.svg"
    }
  ]
}
