import axios from 'axios';
let SUBGRAPH_URL = '';

async function getCurrentExchangeRate() {
    const query = `
    {
        stakePoolExchangeRates{
          stkBnbToBnb
          lastUpdatedBlock
        }
        }
`;
    let data;
    let exchangeRate;
    await axios.post(SUBGRAPH_URL, { query }).then(result => {
        data = result.data.data;
        exchangeRate = data.stakePoolExchangeRates[0].stkBnbToBnb;
    });
    return exchangeRate;
}

async function getBlock(n: number) {
    const query = `
    {
        stakePoolEpochUpdateEvents(skip:${
            n - 1
        },first:1  , orderBy: blockNum, orderDirection: desc) {
          blockNum
        }
    }
`;
    let data: any;
    await axios.post(SUBGRAPH_URL, { query }).then(result => {
        data = result.data.data;
    });
    return data.stakePoolEpochUpdateEvents[0].blockNum;
}

async function getNthExchangeRate(block: any) {
    const query = `
    {
    stakePoolExchangeRates(block: {number: ${block}}) {
        stkBnbToBnb
      }
    }
`;

    let data;
    let exchangeRate;
    await axios.post(SUBGRAPH_URL, { query }).then(result => {
        data = result.data.data;
        exchangeRate = data.stakePoolExchangeRates[0].stkBnbToBnb;
    });
    return exchangeRate;
}

export async function calculateApr(url: string, n: number): Promise<number> {
    SUBGRAPH_URL = url;
    const currentExchangeRate: any = await getCurrentExchangeRate();
    const block: any = await getBlock(n);
    const nthExchangeRate: any = await getNthExchangeRate(block);
    const apr = ((currentExchangeRate - nthExchangeRate) / n) * 365 * 100;
    return apr;
}
