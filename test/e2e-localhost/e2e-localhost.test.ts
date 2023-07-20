// import { Wallet, ethers } from "ethers";
import { Wallet, ethers } from 'ethers';
import { Env, LOCALHOST_CONFIG } from '../../src/networkConfig'; // eslint-disable-line node/no-missing-import
import { StkBNBWebSDK } from '../../src/stkbnb-web-sdk'; // eslint-disable-line node/no-missing-import

const LOCALHOST_MNEMONIC = 'test test test test test test test test test test test junk'; // default mnemonic for hardhat

jest.setTimeout(300000);

// Should be skipped if not running locally
describe.skip('End to end tests', () => {
    let instance: StkBNBWebSDK;
    let signer: Wallet;

    beforeAll(async () => {
        signer = Wallet.fromMnemonic(LOCALHOST_MNEMONIC).connect(LOCALHOST_CONFIG.defaultProvider);
        instance = StkBNBWebSDK.getInstance({
            env: Env.Localhost,
            numConfirmations: 1,
            signerOrProvider: signer,
        });
        console.log(await signer.getAddress());
        console.log(await signer.getBalance());
    });

    it('Should stake', async () => {
        await instance.stake(ethers.constants.WeiPerEther.mul(5), { gasLimit: 1000000 });
        await instance.stake(ethers.constants.WeiPerEther.mul(1), { gasLimit: 1000000 });
        console.log(await instance.getClaimsLength());
    });

    it('should see how much it has', async () => {
        await instance.unstake(ethers.constants.WeiPerEther.mul(1), { gasLimit: 1000000 });
        console.log(await instance.getClaimsLength());
    });

    it('should log the balance', async () => {
        console.log(await signer.getBalance());
    });

    it('should instant claim', async () => {
        await instance.instantClaim(ethers.constants.WeiPerEther.mul(1), { gasLimit: 1000000 });
        console.log(await signer.getBalance());
    });
});
