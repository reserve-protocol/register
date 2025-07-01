# Mixpanel Tracking Implementation Summary

This document summarizes the comprehensive Mixpanel tracking functionality that has been restored to the react-zapper package.

## Initialization

Mixpanel is automatically initialized with the hardcoded token from `constants.ts`:
- Token: `38b91d7b8b87d95e01c755fb6e2e3b2e`
- Initialized in `/src/utils/tracking.ts`

## Tracking Events Implemented

### 1. Modal Events
- **zapper_modal**: Tracks when the zapper modal is opened or closed
  - Action: 'open' | 'close'
  - Includes: ticker, contract address, chain ID

### 2. Tab Switching
- **zapper_tab_switch**: Tracks when users switch between buy/sell tabs
  - Action: 'buy' | 'sell'
  - Includes: ticker, contract address, chain ID

### 3. Settings Interactions
- **zapper_settings**: Tracks all settings interactions
  - Actions: 'open' | 'close' | 'change'
  - For changes: includes setting name and new value
  - Settings tracked: slippage, force_mint
  - Includes: ticker, contract address, chain ID

### 4. Quote Refreshes
- **zapper_quote_refresh**: Tracks when quotes are refreshed
  - Types: 'manual' | 'auto'
  - Manual: User clicks refresh button
  - Auto: Automatic fetch during API calls
  - Includes: ticker, contract address, chain ID, amount, tab, quote value

### 5. Transaction Events
- **zapper_transaction_submit**: Tracks when transactions are submitted
  - Includes: transaction type (buy/sell), input/output symbols, amounts
  - Additional data: gas estimates, price impact
  
- **zapper_transaction_success**: Tracks successful transactions
  - Includes: transaction hash, input/output symbols, amounts
  - Additional data: output amount, gas used

- **zapper_transaction_error**: Tracks transaction failures
  - Includes: error message, transaction type, input/output symbols
  - Additional data: error type (approval_error, send_error, transaction_error)

### 6. API Events
- **zapper_api_error**: Tracks API call failures
  - Includes: endpoint URL, error message
  - Includes: ticker, contract address, chain ID

### 7. Token Selection
- **zapper_token_select**: Tracks when users select different tokens
  - Types: 'input' | 'output'
  - Includes: selected token symbol, ticker, contract address, chain ID

### 8. Page Views
- **page_view**: Tracks page/component views (using standard tracking pattern)
  - Includes: page, subpage, and additional context data

### 9. Click/Tap Events
- **tap**: Generic click/tap event tracking
  - Includes: page, CTA label, ticker, contract address, chain ID

## Implementation Details

### Files Modified/Created

1. **New Files:**
   - `/src/utils/tracking.ts` - Main tracking implementation

2. **Modified Files:**
   - `/src/components/zap-mint/index.tsx` - Modal open/close, settings, quote refresh
   - `/src/components/zapper.tsx` - Tab switching, settings, quote refresh
   - `/src/components/zap-mint/buy/index.tsx` - Token selection, tab switching
   - `/src/components/zap-mint/sell/index.tsx` - Token selection, tab switching
   - `/src/components/zap-mint/submit-zap.tsx` - Transaction events
   - `/src/components/zap-mint/zap-settings.tsx` - Settings changes
   - `/src/hooks/useZapSwapQuery.ts` - API errors and auto quote refresh
   - `/src/utils/index.ts` - Export tracking functions
   - `/src/index.ts` - Export tracking functions for external use

### Data Structure

All tracking events include a consistent data structure:
```typescript
interface TrackingData {
  page?: string
  subpage?: string
  cta?: string
  ca?: string          // Contract address
  ticker?: string      // Token symbol
  chain?: string | number
  input?: string       // Input token symbol
  output?: string      // Output token symbol
  error?: string
  txHash?: string
  slippage?: number
  amount?: string
  quote?: string
  setting?: string
  value?: string | number | boolean
  tab?: string
  endpoint?: string
  errorType?: string
  gas?: string
  truePriceImpact?: string
  outputAmount?: string
}
```

## Usage

### For Package Consumers

The tracking functions are exported from the main package and can be used externally:

```typescript
import { trackZapperModal, trackTransactionSuccess } from '@reserve-protocol/react-zapper'

// Track external events
trackZapperModal('open', 'TOKEN_SYMBOL', '0x...', 1)
```

### Internal Usage

All tracking is automatic and requires no additional configuration. The package will track all user interactions automatically when:

1. Users open/close the zapper modal
2. Users switch between buy/sell tabs
3. Users change settings (slippage, force mint)
4. Users refresh quotes (manual or automatic)
5. Users select different tokens
6. Transactions are submitted, succeed, or fail
7. API calls fail

## Error Handling

- All tracking calls are wrapped in try-catch blocks
- Failed tracking calls log warnings but don't interrupt user flow
- Mixpanel initialization is safe and won't break if the service is unavailable

## Privacy Considerations

- No personal information (wallet addresses, private keys) is tracked
- Only contract addresses, token symbols, and interaction data are sent
- Users can inspect all tracking calls in browser developer tools
- Tracking follows standard analytics practices for DeFi applications