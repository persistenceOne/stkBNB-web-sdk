import { BigNumber, TypedDataDomain } from 'ethers';
import { Env, NetworkConfigMap } from './networkConfig'; // eslint-disable-line node/no-missing-import

const StakePoolDomainLocalhost: TypedDataDomain = {
    name: 'Stake Pool',
    version: 'v2',
    chainId: 31337, // Hardhat
    verifyingContract: NetworkConfigMap[Env.Localhost].stakePool,
};

const StakePoolDomainTestnet: TypedDataDomain = {
    name: 'Stake Pool',
    version: 'v2',
    chainId: 97, // BSC testnet
    verifyingContract: NetworkConfigMap[Env.Testnet].stakePool,
};

const StakePoolDomainMainnet: TypedDataDomain = {
    name: 'Stake Pool',
    version: 'v2',
    chainId: 56, // BSC mainnet
    verifyingContract: NetworkConfigMap[Env.Mainnet].stakePool,
};

export const StakePoolDomainMap: { [key in Env]: TypedDataDomain } = {
    [Env.Localhost]: StakePoolDomainLocalhost,
    [Env.Testnet]: StakePoolDomainTestnet,
    [Env.Mainnet]: StakePoolDomainMainnet,
}

export const ClaimDataType = {
    Claim: [{ name: 'index', type: 'uint256' }],
};

export type ClaimArgs = {
    index: BigNumber;
};
