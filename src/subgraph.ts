import axios from 'axios';

async function getCurrentExchangeRate(url: string): Promise<number> {
    const query: string = `
    {
      stakePoolExchangeRates{
        stkBnbToBnb
      }
    }
`;
    let data;
    let exchangeRate: number = 0;
    await axios.post(url, { query }).then(result => {
        data = result.data.data;
        exchangeRate = data.stakePoolExchangeRates[0].stkBnbToBnb;
    });

    return exchangeRate;
}

async function getBlock(url: string, n: number): Promise<number> {
    const query: string = `
    {
        stakePoolEpochUpdateEvents(
          skip:${n},
          first:1,
          orderBy: blockNum,
          orderDirection: desc
        ) {
            blockNum
        }
    }
`;
    let blockNum: number = 0;
    await axios.post(url, { query }).then(result => {
        blockNum = Number(result.data.data.stakePoolEpochUpdateEvents[0].blockNum);
    });
    return blockNum;
}

async function getNthExchangeRate(url: string, block: number): Promise<number> {
    const query: string = `
    {
      stakePoolExchangeRates(block: {number: ${block}}) {
        stkBnbToBnb
      }
    }
`;
    let exchangeRate: number = 0;
    await axios.post(url, { query }).then(result => {
        exchangeRate = result.data.data.stakePoolExchangeRates[0].stkBnbToBnb;
    });
    return exchangeRate;
}

export async function calculateApr(url: string, n: number): Promise<number> {
    const currentExchangeRate: number = await getCurrentExchangeRate(url);
    const block: number = await getBlock(url, n);
    const nthExchangeRate: number = await getNthExchangeRate(url, block);
    const apr = ((currentExchangeRate - nthExchangeRate) / n) * 365 * 100;
    console.log('APR:', n, apr);
    return apr;
}
