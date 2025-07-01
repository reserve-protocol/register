# @reserve-protocol/react-zapper

A React component library for integrating DTF (Decentralized Trading Fund) zap functionality into your Web3 applications. This package provides a complete zapping solution with support for both modal and inline modes, built on top of Wagmi, Viem, and RainbowKit.

## Features

- 🔄 **Zap Minting**: Convert any supported token directly into DTF tokens
- 🔄 **Zap Redeeming**: Convert DTF tokens back to any supported token
- 🎨 **Flexible UI**: Modal or inline display modes
- 🌈 **Customizable**: Theme support and color overrides
- 🔗 **Web3 Ready**: Built-in wallet integration with RainbowKit
- ⚡ **Optimized**: Real-time price updates and slippage protection
- 🛡️ **Type Safe**: Full TypeScript support

## Installation

```bash
npm install @reserve-protocol/react-zapper
```

### Peer Dependencies

Make sure you have these peer dependencies installed:

```bash
npm install react react-dom @tanstack/react-query wagmi viem @rainbow-me/rainbowkit jotai
```

## Quick Start

### 1. Basic Modal Usage

```tsx
import { Zapper, ZapperConfig } from '@reserve-protocol/react-zapper'
import { useConfig } from 'wagmi'

function MyApp() {
  const wagmiConfig = useConfig()

  const zapperConfig: ZapperConfig = {
    wagmiConfig,
    chainId: 1, // Ethereum mainnet
    dtf: {
      address: '0x123...', // Your DTF contract address
      symbol: 'MYDTF',
      name: 'My DTF Token',
      decimals: 18,
      logoUri: 'https://example.com/logo.png', // Optional
    },
    apiUrl: 'https://api.reserve.org', // Optional
  }

  return (
    <Zapper config={zapperConfig} mode="modal">
      <button>Open Zapper</button>
    </Zapper>
  )
}
```

### 2. Inline Usage

```tsx
import { Zapper, ZapperConfig } from '@reserve-protocol/react-zapper'

function ZapperPage() {
  const zapperConfig: ZapperConfig = {
    // ... same config as above
  }

  return (
    <div className="max-w-md mx-auto">
      <h1>Zap into My DTF</h1>
      <Zapper config={zapperConfig} mode="inline" />
    </div>
  )
}
```

### 3. Using the Modal Hook

```tsx
import { Zapper, useZapperModal } from '@reserve-protocol/react-zapper'

function MyComponent() {
  const { isOpen, open, close } = useZapperModal()

  return (
    <>
      <button onClick={open}>Open Zapper</button>

      <Zapper
        config={zapperConfig}
        mode="modal"
        isOpen={isOpen}
        onOpenChange={(open) => !open && close()}
      />
    </>
  )
}
```

## Configuration

### ZapperConfig

| Property      | Type        | Required | Description                                   |
| ------------- | ----------- | -------- | --------------------------------------------- |
| `wagmiConfig` | `Config`    | ✅       | Wagmi configuration object                    |
| `chainId`     | `number`    | ✅       | Chain ID where the DTF is deployed            |
| `dtf`         | `DTFConfig` | ✅       | DTF token configuration object                |
| `apiUrl`      | `string`    | ❌       | Custom API endpoint (defaults to Reserve API) |

### DTFConfig

| Property   | Type      | Required | Description                 |
| ---------- | --------- | -------- | --------------------------- |
| `address`  | `Address` | ✅       | DTF contract address        |
| `symbol`   | `string`  | ✅       | DTF token symbol            |
| `name`     | `string`  | ✅       | DTF token name              |
| `decimals` | `number`  | ✅       | DTF token decimals          |
| `logoUri`  | `string`  | ❌       | Optional DTF token logo URL |

### ZapperProps

| Property       | Type                       | Default   | Description                                      |
| -------------- | -------------------------- | --------- | ------------------------------------------------ |
| `config`       | `ZapperConfig`             | -         | Configuration object (required)                  |
| `mode`         | `'modal' \| 'inline'`      | `'modal'` | Display mode                                     |
| `theme`        | `ZapperTheme`              | -         | Custom theme overrides                           |
| `isOpen`       | `boolean`                  | -         | Control modal state externally (modal mode only) |
| `onOpenChange` | `(open: boolean) => void`  | -         | Modal state change callback                      |
| `onSuccess`    | `(txHash: string) => void` | -         | Transaction success callback                     |
| `onError`      | `(error: Error) => void`   | -         | Error callback                                   |
| `className`    | `string`                   | -         | Additional CSS classes                           |
| `children`     | `ReactNode`                | -         | Trigger element (modal mode only)                |

## Theming

Customize the appearance with the `theme` prop:

```tsx
const customTheme: ZapperTheme = {
  primaryColor: '#3b82f6',
  secondaryColor: '#6b7280',
  backgroundColor: '#ffffff',
  textColor: '#111827',
  borderColor: '#e5e7eb',
  borderRadius: '8px',
}

<Zapper
  config={zapperConfig}
  theme={customTheme}
  mode="inline"
/>
```

## Advanced Usage

### With Custom Error Handling

```tsx
function AdvancedZapper() {
  const handleSuccess = (txHash: string) => {
    toast.success(`Transaction successful: ${txHash}`)
    // Refresh user balances, analytics, etc.
  }

  const handleError = (error: Error) => {
    console.error('Zap failed:', error)
    toast.error(`Zap failed: ${error.message}`)
  }

  return (
    <Zapper
      config={zapperConfig}
      mode="modal"
      onSuccess={handleSuccess}
      onError={handleError}
    >
      <button className="btn-primary">Zap Now</button>
    </Zapper>
  )
}
```

### With Custom Styling

```tsx
<Zapper
  config={zapperConfig}
  mode="inline"
  className="border-2 border-blue-500 rounded-lg p-4"
  theme={{
    primaryColor: 'hsl(220, 100%, 50%)',
    borderRadius: '12px',
  }}
/>
```

## Supported Chains

The zapper currently supports:

- **Ethereum Mainnet** (Chain ID: 1)
- **Base** (Chain ID: 8453)
- **Arbitrum One** (Chain ID: 42161)

Each chain has its own set of supported tokens for zapping. The component automatically detects the current chain and shows appropriate tokens.

## API Integration

The package integrates with the Reserve Protocol's zapper API for:

- Real-time swap quotes
- Price impact calculations
- Transaction routing optimization
- Health status monitoring

You can customize the API endpoint via the `apiUrl` config option.

## Analytics

The package includes built-in analytics tracking via Mixpanel to help improve the user experience. The analytics token is hardcoded within the package for consistency across all implementations.

## TypeScript Support

Full TypeScript support is included with exported types:

```tsx
import type {
  ZapperProps,
  ZapperConfig,
  ZapperTheme,
  UseZapperModalReturn,
  Token,
  TokenBalance,
} from '@reserve-protocol/react-zapper'
```

## Contributing

This package is part of the Reserve Protocol ecosystem. For issues, feature requests, or contributions, please visit the [Reserve Protocol GitHub repository](https://github.com/reserve-protocol).

## License

MIT License - see LICENSE file for details.
