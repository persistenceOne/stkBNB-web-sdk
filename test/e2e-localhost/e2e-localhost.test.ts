import { Wallet, ethers } from 'ethers';
import { Env, NetworkConfigMap } from '../../src/networkConfig'; // eslint-disable-line node/no-missing-import
import { StkBNBWebSDK } from '../../src/stkbnb-web-sdk'; // eslint-disable-line node/no-missing-import

const LOCALHOST_MNEMONIC = 'test test test test test test test test test test test junk'; // default mnemonic for hardhat

jest.setTimeout(300000);

// Should be skipped if not running locally
describe.skip('End to end tests', () => {
    let instance: StkBNBWebSDK;
    let signer: Wallet;

    beforeAll(async () => {
        signer = Wallet.fromMnemonic(LOCALHOST_MNEMONIC).connect(
            NetworkConfigMap[Env.Localhost].defaultProvider,
        );
        instance = StkBNBWebSDK.getInstance({
            env: Env.Localhost,
            numConfirmations: 1,
            signerOrProvider: signer,
        });
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

    it.skip('should create a valid signature', async () => {
        await instance.stake(ethers.constants.WeiPerEther.mul(4), { gasLimit: 1000000 });
        await instance.unstake(ethers.constants.WeiPerEther.mul(1), { gasLimit: 1000000 });
        console.log(await instance.getClaimsLength());
        await instance.scheduleAutomatedClaim(0);
    });
});
