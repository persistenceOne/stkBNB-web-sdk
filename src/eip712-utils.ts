import { BigNumber, TypedDataDomain } from 'ethers';
import { MAINNET_CONFIG, TESTNET_CONFIG, LOCALHOST_CONFIG } from './networkConfig'; // eslint-disable-line node/no-missing-import

export const StakePoolDomainLocalhost: TypedDataDomain = {
    name: 'Stake Pool',
    version: 'v2',
    chainId: 31337, // Hardhat
    verifyingContract: LOCALHOST_CONFIG.stakePool,
};

export const StakePoolDomainTestnet: TypedDataDomain = {
    name: 'Stake Pool',
    version: 'v2',
    chainId: 97, // BSC testnet
    verifyingContract: TESTNET_CONFIG.stakePool,
};

export const StakePoolDomainMainnet: TypedDataDomain = {
    name: 'Stake Pool',
    version: 'v2',
    chainId: 56, // BSC mainnet
    verifyingContract: MAINNET_CONFIG.stakePool,
};

export const ClaimDataType = {
    Claim: [{ name: 'index', type: 'uint256' }],
};

export type ClaimArgs = {
    index: BigNumber;
};
