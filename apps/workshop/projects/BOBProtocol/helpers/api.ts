// {"ticker_id":"BOB_USDC","base":"BOB","target":"USDC","pool_id":"bobvault_polygon"}
export type Pair = {
  ticker_id: string;
  base: string;
  target: string;
  pool_id: string;
};

// {"bids":[["843886.022353","0.9999"]],"asks":[["4156113.7593693696","1.000080006400512"]],"ticker_id":"BOB_USDC","timestamp":"1684157656"}
export class OrderBook {
  public bids: number[][] = [];
  public asks: number[][] = [];
  public ticker_id = '';
  public timestamp = 0;

  constructor(response: any) {
    this.bids = [[parseFloat(response.bids[0][0]), parseFloat(response.bids[0][1])]];
    this.asks = [[parseFloat(response.asks[0][0]), parseFloat(response.asks[0][1])]];
    this.ticker_id = response.ticker_id;
    this.timestamp = parseInt(response.timestamp);
  }
}

export async function getPairs(base_url: string, axios: any, logger: any): Promise<Pair[] | null> {
  const url = `${base_url}/pairs`;
  try {
    const response = await axios.get(url);

    if (response.data) {
      return response.data as Pair[];
    }
  } catch (ex) {
    logger.error(`Call to ${url} failed`, ex);
  }
  return null;
}

export async function getOrderBookForTicker(
  base_url: string,
  ticker: string,
  axios: any,
  logger: any,
): Promise<OrderBook | null> {
  const url = `${base_url}/orderbook?ticker_id=${ticker}`;
  try {
    const response = await axios.get(url);

    if (response.data) {
      return new OrderBook(response.data);
    }
  } catch (ex) {
    logger.error(`Call to ${url} failed`, ex);
  }
  return null;
}

export function getTvlFromOrderbook(ob: OrderBook, symbol: string): number {
  const idx = ob.ticker_id.indexOf(symbol);
  if (idx >= 0) {
    if (idx === 0) {
      return ob.asks[0][0];
    } else {
      return ob.bids[0][0];
    }
  } else {
    return 0;
  }
}
