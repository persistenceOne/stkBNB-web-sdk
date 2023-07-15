import { providers } from 'ethers';

/**
 * Type to represent network configuration for different BSC networks
 */
export interface NetworkConfig {
    /**
     * address of StakePool
     */
    stakePool: string;
    /**
     * address of stkBNB
     */
    stkBNB: string;
    /**
     * the default provider for the network
     */
    defaultProvider: providers.Provider;
    /**
     * number of block confirmations to wait for a tx to finalize
     */
    numConfirmations: number;
    /**
     * endpoint url of subgraph
     */
    subgraphUrl: string;
}

/**
 * The environment to connect to
 */
export enum Env {
    /**
     * Connect to BSC mainnet
     */
    Mainnet, // eslint-disable-line no-unused-vars
    /**
     * Connect to BSC testnet
     */
    Testnet, // eslint-disable-line no-unused-vars
    /**
     * Connect to localhost hardhat
     */
    Localhost, // eslint-disable-line no-unused-vars
}

/**
 * Network configuration for mainnet
 */
export const MAINNET_CONFIG: NetworkConfig = {
    stakePool: '0xC228CefDF841dEfDbD5B3a18dFD414cC0dbfa0D8',
    stkBNB: '0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16',
    defaultProvider: new providers.JsonRpcProvider('https://bsc-dataseed.binance.org/', {
        name: 'BNB Smart Chain Mainnet',
        chainId: 56,
    }),
    numConfirmations: 5,
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/persistenceone/stkbnb',
};

/**
 * Network configuration for testnet
 */
export const TESTNET_CONFIG: NetworkConfig = {
    stakePool: '0x7CdFba1Ee6A8D1e688B4B34A56b62287ce400802',
    stkBNB: '0xF7CE8444b3b1c62e785a25343a8B4764198A81B8',
    defaultProvider: new providers.JsonRpcProvider(
        'https://data-seed-prebsc-1-s1.binance.org:8545',
        { name: 'BNB Smart Chain Testnet', chainId: 97 },
    ),
    numConfirmations: 1,
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/persistenceone/stkbnb---dev',
};

export const LOCALHOST_CONFIG: NetworkConfig = {
    stakePool: '0x2279b7a0a67db372996a5fab50d91eaa73d2ebe6',
    stkBNB: '0x5fc8d32690cc91d4c39d9d3abcbd16989f875707',
    defaultProvider: new providers.JsonRpcProvider(
        'http://localhost:8545',
        { name: 'Hardhat Localhost', chainId: 31337 },
    ),
    numConfirmations: 1,
    subgraphUrl: '',
}