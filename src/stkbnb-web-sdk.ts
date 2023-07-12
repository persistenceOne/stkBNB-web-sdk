import { BigNumber, BigNumberish, ContractReceipt, FixedNumber, providers, Signer } from 'ethers';
import { StakePool__factory, StkBNB__factory } from './contracts'; // eslint-disable-line camelcase, node/no-missing-import
import type { StakePool, StkBNB } from './contracts'; // eslint-disable-line node/no-missing-import
import { calculateApr } from '../src/subgraph'; // eslint-disable-line node/no-missing-import
import { Env, MAINNET_CONFIG, TESTNET_CONFIG } from './networkConfig'; // eslint-disable-line node/no-missing-import

/**
 * Configuration options for sdk
 */
export interface Options {
    /**
     * Give a Signer for transacting with the blockchain.<br>
     * Give a Provider for read-only operations.
     *
     * @defaultValue
     * If nothing is given, defaults to a Provider for the configured env using [Binance RPCs](https://docs.bnbchain.org/docs/rpc).
     *
     * @remarks
     * When providing this field, ensure that it is correct for the configured env.
     * i.e., you are not using a Provider/Signer for testnet when the env is mainnet and vice-versa.
     */
    signerOrProvider?: Signer | providers.Provider;
    /**
     * The environment to connect to.<br>
     *
     * @defaultValue {@link Env.Mainnet}
     */
    env?: Env;
    /**
     * Number of block confirmations to wait for a block to finalize.<br>
     *
     * @defaultValue
     * {@link Env.Mainnet}: 5<br>
     * {@link Env.Testnet}: 1
     */
    numConfirmations?: number;
}

/**
 * The main sdk API.
 *
 * ```ts
 * import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
 * import { ethers } from 'ethers';
 *
 * const sdk = StkBNBWebSDK.getInstance(); // get the mainnet instance
 * const exchangeRate = await sdk.convertToBNB(ethers.constants.WeiPerEther); // find how much 1 stkBNB is worth
 * console.log(`1 stkBNB = ${StkBNBWebSDK.format(exchangeRate)} BNB`); // 1 stkBNB = 1.004202 BNB
 * ```
 */
export class StkBNBWebSDK {
    private readonly _stakePool: StakePool;
    private readonly _stkBNB: StkBNB;
    private readonly _numConfirmations: number;
    private readonly _subgraphUrl: string;
    private readonly _signerOrProvider: Signer | providers.Provider;

    private constructor(opts: Options) {
        let network = MAINNET_CONFIG;
        if (opts.env === Env.Testnet) {
            network = TESTNET_CONFIG;
        }
        const signerOrProvider = opts.signerOrProvider || network.defaultProvider;
        this._signerOrProvider = signerOrProvider;

        this._stakePool = StakePool__factory.connect(network.stakePool, signerOrProvider); // eslint-disable-line camelcase
        this._stkBNB = StkBNB__factory.connect(network.stkBNB, signerOrProvider); // eslint-disable-line camelcase

        this._numConfirmations = opts.numConfirmations || network.numConfirmations;
        if (this._numConfirmations < 1) {
            this._numConfirmations = 1;
        }
        this._subgraphUrl = network.subgraphUrl;
    }

    /**
     * Get a new instance of the sdk.
     * Any transactions initiated by this instance will wait for the transaction to finalize as per the configured {@link Options.numConfirmations | opts.numConfirmations}.
     *
     * ```ts
     * // Get the testnet instance:
     * import { StkBNBWebSDK, Env } from "@persistenceone/stkbnb-web-sdk";
     *
     * const sdk = StkBNBWebSDK.getInstance({env: Env.Testnet});
     * ```
     * <br>
     *
     * ```ts
     * // OR get the mainnet instance for reading the blockchain:
     * import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
     *
     *  const sdk = StkBNBWebSDK.getInstance();
     * ```
     * <br>
     *
     * ```ts
     * // OR get the mainnet instance for carrying out transactions:
     * import { StkBNBWebSDK, MAINNET_CONFIG } from "@persistenceone/stkbnb-web-sdk";
     * import { ethers } from 'ethers';
     *
     * const provider = MAINNET_CONFIG.defaultProvider; // or use your own JSON RPC provider
     * const wallet = ethers.Wallet.fromMnemonic('...').connect(provider); // or use your existing wallet instance
     * const sdk = StkBNBWebSDK.getInstance({signerOrProvider: wallet}); // just provide the signer here
     * ```
     */
    public static getInstance(opts?: Options): StkBNBWebSDK {
        return new StkBNBWebSDK(opts || {});
    }

    /**
     * Rounds an 18 decimal token balance value to 6 digits of precision to show in the UI.
     *
     * ```ts
     * import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
     * import { ethers } from 'ethers';
     *
     * const sdk = StkBNBWebSDK.getInstance(); // get the mainnet instance
     * const exchangeRate = await sdk.convertToBNB(ethers.constants.WeiPerEther); // find how much 1 stkBNB is worth
     * console.log(`1 stkBNB = ${StkBNBWebSDK.format(exchangeRate)} BNB`); // 1 stkBNB = 1.004202 BNB
     * ```
     *
     * @param value - The value to format
     * @param roundToDecimals - The number of decimals to show in the UI
     *
     * @returns The formatted value with 6 digits of precision.
     */
    public static format(value: BigNumberish, roundToDecimals: number = 6): string {
        return FixedNumber.fromValue(BigNumber.from(value), 18).round(roundToDecimals).toString();
    }

    /**
     * Stake BNB for the signer.
     *
     * ```ts
     * import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
     * import { ethers } from 'ethers';
     *
     * const sdk = StkBNBWebSDK.getInstance({signerOrProvider: ...}); // just provide the signer here
     * const { transactionHash } = await sdk.stake(ethers.constants.WeiPerEther); // stake 1 BNB
     * ```
     *
     * @param amount - Amount of BNB to stake
     *
     * @returns A transaction receipt for the interaction with the contract
     */
    public async stake(amount: BigNumberish): Promise<ContractReceipt> {
        const tx = await this._stakePool.deposit({ value: amount });
        return tx.wait(this._numConfirmations);
    }

    /**
     * Unstake BNB for the signer.
     * The unstaked amount will be available to claim after the cooldown period is over.
     *
     * ```ts
     * import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
     * import { ethers } from 'ethers';
     *
     * const sdk = StkBNBWebSDK.getInstance({signerOrProvider: ...}); // just provide the signer here
     * const { transactionHash } = await sdk.unstake(ethers.constants.WeiPerEther); // unstake 1 stkBNB
     * ```
     *
     * @param amount - Amount of stkBNB to unstake
     *
     * @returns A transaction receipt for the interaction with the contract
     */
    public async unstake(amount: BigNumberish): Promise<ContractReceipt> {
        const tx = await this._stkBNB.send(this._stakePool.address, amount, []);
        return tx.wait(this._numConfirmations);
    }

    /**
     * Claims all the claim requests for the signer.
     *
     * ```ts
     * import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
     *
     * const sdk = StkBNBWebSDK.getInstance({signerOrProvider: ...}); // just provide the signer here
     * const { transactionHash } = await sdk.claimAll();
     * ```
     *
     * @returns A transaction receipt for the interaction with the contract
     */
    public async claimAll(): Promise<ContractReceipt> {
        const tx = await this._stakePool.claimAll();
        return tx.wait(this._numConfirmations);
    }

    /**
     * Claim a particular claim request for the signer.
     *
     * ```ts
     * import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
     *
     * const sdk = StkBNBWebSDK.getInstance({signerOrProvider: ...}); // just provide the signer here
     * const { transactionHash } = await sdk.claim(0); // claim the request at index 0
     * ```
     *
     * @param index - Index of the claim request to be claimed
     *
     * @returns A transaction receipt for the interaction with the contract
     */
    public async claim(index: BigNumberish): Promise<ContractReceipt> {
        const tx = await this._stakePool.claim(index);
        return tx.wait(this._numConfirmations);
    }

    /**
     * Claim a particular claim request for the signer instantly. Deducts a fee.
     *
     * ```ts
     * import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
     *
     * const sdk = StkBNBWebSDK.getInstance({signerOrProvider: ...}); // just provide the signer here
     * const { transactionHash } = await sdk.instantClaim(0); // claim the request at index 0
     * ```
     *
     * @param index - Index of the claim request to be claimed
     *
     * @returns A transaction receipt for the interaction with the contract
     */
    public async instantClaim(index: BigNumberish): Promise<ContractReceipt> {
        const tx = await this._stakePool.instantClaim(index);
        return tx.wait(this._numConfirmations);
    }

    /**
     * Get the number of claims for the current user.
     *
     * ```ts
     * import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
     *
     * const sdk = StkBNBWebSDK.getInstance({signerOrProvider: ...}); // just provide the signer here
     * const numberOfClaims = await sdk.getClaimsLength(); // you get the number of claims for the current user
     * ```
     *
     * @returns A promise that resolves to the number of claims for the current user.
     */
    public async getClaimsLength(): Promise<number> {
        const userAddress = await (this._signerOrProvider as Signer).getAddress();

        const length = await this._stakePool.getClaimRequestCount(userAddress);
        return length.toNumber();
    }

    /**
     * Check if a particular claim request for the signer can be claimed instantly.
     *
     * ```ts
     * import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
     *
     * const sdk = StkBNBWebSDK.getInstance({signerOrProvider: ...}); // just provide the signer here
     * const yesOrNo = await sdk.canBeClaimedInstantly(0); // check the claim request at index 0
     * ```
     *
     * @param index - Index of the claim request to be claimed for that specific user.
     *
     * @returns A promise that resolves to a boolean value indicating if the claim request can be claimed instantly.
     */
    public async canBeClaimedInstantly(index: BigNumberish): Promise<boolean> {
        const excessBnb = await this.getInstantClaimAvailableAmount();

        const userAddress = await (this._signerOrProvider as Signer).getAddress();
        const claimRequest = await this._stakePool.claimReqs(userAddress, index);
        const weiToReturn = claimRequest[0]; // weiToReturn is the first field.
        return excessBnb.gte(weiToReturn);
    }

    /**
     * Get the available amount for instant claim requests.
     *
     * ```ts
     * import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
     *
     * const sdk = StkBNBWebSDK.getInstance({signerOrProvider: ...}); // provide at least the provider
     * const weiAvailable = await sdk.getInstantClaimAvailableAmount();
     * ```
     *
     * @param index - Index of the claim request to be claimed for that specific user.
     *
     * @returns A promise that resolves to the available wei amount for instant claim requests.
     */
    public async getInstantClaimAvailableAmount(): Promise<BigNumber> {
        const claimReserve = await this._stakePool.claimReserve();
        const contractBalance = await this._signerOrProvider.getBalance(this._stakePool.address);
        return contractBalance.sub(claimReserve);
    }

    /**
     * Get the current unlock period for the claims.
     *
     * ```ts
     * import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
     *
     * const sdk = StkBNBWebSDK.getInstance({signerOrProvider: ...}); // just provide the signer here
     * const cooldownPeriodInSeconds = await sdk.getClaimUnlockTime(); // how many seconds need to pass for claim to be unlocked
     * ```
     * @returns
     */
    public async getClaimUnlockTime(): Promise<number> {
        const config = await this._stakePool.config();
        return config.cooldownPeriod.toNumber();
    }

    /**
     * Converts stkBNB to BNB based on the current exchange rate in the contract.
     *
     * ```ts
     * import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
     * import { ethers } from 'ethers';
     *
     * const sdk = StkBNBWebSDK.getInstance(); // get the mainnet instance
     * const exchangeRate = await sdk.convertToBNB(ethers.constants.WeiPerEther); // find how much 1 stkBNB is worth
     * console.log(`1 stkBNB = ${StkBNBWebSDK.format(exchangeRate)} BNB`); // 1 stkBNB = 1.004202 BNB
     * ```
     *
     * @param amount - Amount of stkBNB to convert to BNB
     *
     * @returns The BNB equivalent of the given amount
     */
    public async convertToBNB(amount: BigNumberish): Promise<BigNumber> {
        const exchangeRate = await this._stakePool.exchangeRate();
        return BigNumber.from(amount).mul(exchangeRate.totalWei).div(exchangeRate.poolTokenSupply);
    }

    /**
     * Converts BNB to stkBNB based on the current exchange rate in the contract.
     *
     * ```ts
     * import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
     * import { ethers } from 'ethers';
     *
     * const sdk = StkBNBWebSDK.getInstance(); // get the mainnet instance
     * const exchangeRate = await sdk.convertToStkBNB(ethers.constants.WeiPerEther); // find how much 1 BNB is worth
     * console.log(`1 BNB = ${StkBNBWebSDK.format(exchangeRate)} stkBNB`); // 1 BNB = 0.995815 stkBNB
     * ```
     *
     * @param amount - Amount of BNB to convert to stkBNB
     *
     * @returns The stkBNB equivalent of the given amount
     */
    public async convertToStkBNB(amount: BigNumberish): Promise<BigNumber> {
        const exchangeRate = await this._stakePool.exchangeRate();
        return BigNumber.from(amount).mul(exchangeRate.poolTokenSupply).div(exchangeRate.totalWei);
    }

    /**
     * Fetches all the claim requests for the user.
     *
     * ```ts
     * import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
     *
     * const sdk = StkBNBWebSDK.getInstance(); // get the mainnet instance
     * const claimRequests = await sdk.getClaims('0xa8E41F290ECfe99488D2F5f6621daf36a592e1D7'); // get all the claim requests for the address 0xa8E41F290ECfe99488D2F5f6621daf36a592e1D7
     * ```
     *
     * @param user - The address of the user to query
     *
     * @returns An array containing all the claim requests for the user
     */
    public async getClaims(user: string): Promise<StakePool.ClaimRequestStructOutput[]> {
        const count = await this._stakePool.getClaimRequestCount(user);
        // if the user doesn't have any requests, return empty array
        if (count.lte(0)) {
            return [];
        }

        // return all the requests otherwise
        return await this._stakePool.getPaginatedClaimRequests(user, 0, count);
    }

    /**
     * Fetches APR% for n number of days before.
     *
     * ```ts
     * import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
     *
     * const sdk = StkBNBWebSDK.getInstance(); // get the mainnet instance
     * const apr = await sdk.getApr(7); // get apr% between current Exchange rate and 7 days before exchange rate.
     * ```
     *
     * @param n - Number of days for calculating APR.
     *
     * @returns APR% between current and n days before exchange rate.
     */
    public async getApr(n: number): Promise<number> {
        return await calculateApr(this._subgraphUrl, n);
    }

    /**
     * Fetches the current TVL (total value locked), aka TVU (total value unlocked)
     *
     * ```ts
     * import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
     *
     * const sdk = StkBNBWebSDK.getInstance(); // get the mainnet instance
     * const tvl = await sdk.getTvl();
     * console.log(`TVL = ${StkBNBWebSDK.format(tvl, 2)} BNB`); // TVL = 25229.76 BNB
     * ```
     *
     * @returns The current TVL
     */
    public async getTvl(): Promise<BigNumber> {
        return (await this._stakePool.exchangeRate()).totalWei;
    }

    /**
     * @returns An instance of StkBNB to directly interact with the stkBNB contract
     */
    get stkBNB(): StkBNB {
        return this._stkBNB;
    }

    /**
     * @returns An instance of StakePool to directly interact with the StakePool contract
     */
    get stakePool(): StakePool {
        return this._stakePool;
    }

    /**
     * @returns subgraph url
     */
    get subgraphUrl(): string {
        return this._subgraphUrl;
    }
}
