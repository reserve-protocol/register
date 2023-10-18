import {
  createOneInchDexAggregator,
  DexAggregator,
  Universe,
} from '@reserve-protocol/token-zapper'
import mixpanel from 'mixpanel-browser'

/**
 * Creates a 1inch aggregator that will use a list of proxies to make requests
 * @note This is a workaround for 1inch rate limiting.
 * @note The behavior of this aggregator is to try each proxy in a random order until one succeeds. Each aggregator will attempt 3 retries before failing.
 * @note If a proxy returns a 429, we will stop trying to use it since it means this proxy is rate limited.
 * @note If all proxies fail, we will throw an error.
 * @param universe Zapper universe
 * @param proxies List of urls we are using to proxy 1inch requests
 * @returns DexAggregator
 */
export const createProxiedOneInchAggregator = (
  universe: Universe,
  proxies: string[]
) => {
  const aggregatorInstances = Object.freeze(
    proxies.map((proxy) =>
      createOneInchDexAggregator(universe, {
        baseUrl: proxy,
        retryConfig: {
          maxRetries: 2,
          retryDelay: 250,
          backoff: 'CONST',
          timeout: 2000,
          onRetry: async (e: any) => {
            if (e.statusCode === 429) {
              return 'RETURN'
            }
            return 'CONTINUE'
          },
        },
      })
    )
  )

  const returnAggregatorsInRandomOrder = () => {
    const instances = [...aggregatorInstances]
    for (let i = instances.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[instances[i], instances[j]] = [instances[j], instances[i]]
    }
    return instances
  }

  return new DexAggregator(
    'aggregator.1inch.proxied.' + universe.chainId,
    async (payerAddress, recipientDestination, input, output, slippage) => {
      const schedule = returnAggregatorsInRandomOrder()
      for (const aggregator of schedule) {
        try {
          return await aggregator.swap(
            payerAddress,
            recipientDestination,
            input,
            output,
            slippage
          )
        } catch (e) {
          continue
        }
      }
      mixpanel.track('All 1inch aggregators failed', {
        RToken: output.address.toString().toLowerCase() ?? '',
        inputToken: input.token.symbol,
      })
      throw new Error('All aggregators failed')
    }
  )
}
