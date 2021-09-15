import { ICoinMarketQuery } from '.'

export const queryValues = {
  order: {
    MARKET_CAP_DESC: 'market_cap_desc',
    MARKET_CAP_ASC: 'market_cap_asc',
    VOLUME_ASC: 'volume_asc',
    VOLUME_DESC: 'volume_desc',
  },
  currencies: {
    USD: 'usd',
    EUR: 'eur',
  },
  price_changes: {
    ONE_HOUR: '1h',
    ONE_DAY: '24h',
    ONE_WEEK: '7d',
    TWO_WEEKS: '14d',
    ONE_MONTH: '30d',
  },
}

export const getTokenMarketQuery: ICoinMarketQuery = {
  vs_currency: 'usd',
  order: queryValues.order.MARKET_CAP_DESC,
  per_page: 50,
  page: 1,
  sparkline: false,
  price_change_percentage: queryValues.price_changes.ONE_DAY,
}
