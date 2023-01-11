import {
    Env,
    MAINNET_CONFIG,
    NetworkConfig,
    StkBNBWebSDK,
    TESTNET_CONFIG,
} from '../src/stkbnb-web-sdk'; // eslint-disable-line node/no-missing-import
import { ethers, Signer, Wallet } from 'ethers';

/**
 * SDK tests
 */
describe('stkBNB-web-sdk tests', () => {
    it('should format with default precision', function () {
        expect(StkBNBWebSDK.format('123456789123456789')).toEqual('0.123457');
        expect(StkBNBWebSDK.format('123456489123456789')).toEqual('0.123456');
        expect(StkBNBWebSDK.format('1234567891234567890')).toEqual('1.234568');
        expect(StkBNBWebSDK.format('1234567491234567890')).toEqual('1.234567');
    });

    it('should format with custom precision', function () {
        expect(StkBNBWebSDK.format('123456789123456789', 0)).toEqual('0.0');
        expect(StkBNBWebSDK.format('123456489123456789', 1)).toEqual('0.1');
        expect(StkBNBWebSDK.format('123456489123456789', 2)).toEqual('0.12');
        expect(StkBNBWebSDK.format('623456789123456789', 0)).toEqual('1.0');
        expect(StkBNBWebSDK.format('623456489123456789', 1)).toEqual('0.6');
        expect(StkBNBWebSDK.format('623456489123456789', 2)).toEqual('0.62');
        expect(StkBNBWebSDK.format('1234567891234567890', 0)).toEqual('1.0');
        expect(StkBNBWebSDK.format('1234567491234567890', 1)).toEqual('1.2');
        expect(StkBNBWebSDK.format('1234567491234567890', 2)).toEqual('1.23');
        expect(StkBNBWebSDK.format('1234567491234567890', 3)).toEqual('1.235');
    });

    runSuite(Env.Mainnet, MAINNET_CONFIG);
    runSuite(Env.Testnet, TESTNET_CONFIG);
});

function runSuite(env: Env, netConfig: NetworkConfig) {
    const writeProvider: Signer = Wallet.createRandom().connect(netConfig.defaultProvider);
    let readableInstance: StkBNBWebSDK, writableInstance: StkBNBWebSDK;

    describe(Env[env], () => {
        it('should instantiate', () => {
            readableInstance = StkBNBWebSDK.getInstance({
                env,
                signerOrProvider: netConfig.defaultProvider,
            });
            writableInstance = StkBNBWebSDK.getInstance({
                env,
                signerOrProvider: writeProvider,
            });

            expect(readableInstance).toBeInstanceOf(StkBNBWebSDK);
            expect(writableInstance).toBeInstanceOf(StkBNBWebSDK);
        });

        it('stake', async () => {
            await expect(writableInstance.stake(1e9)).rejects.toThrow(/.*insufficient funds.*/);
        }, 60000);

        it('unstake', async () => {
            await expect(writableInstance.unstake(1e9)).rejects.toThrow(
                /.*gas required exceeds allowance \(0\).*/,
            );
        }, 60000);

        it('claimAll', async () => {
            await expect(writableInstance.claimAll()).rejects.toThrow(
                /.*gas required exceeds allowance \(0\).*/,
            );
        }, 60000);

        it('claim', async () => {
            await expect(writableInstance.claim(0)).rejects.toThrow(
                /.*gas required exceeds allowance \(0\).*/,
            );
        }, 60000);

        it('should convertToBNB', async () => {
            expect(
                (await readableInstance.convertToBNB(ethers.constants.WeiPerEther)).toBigInt(),
            ).toBeGreaterThanOrEqual(ethers.constants.WeiPerEther.toBigInt());
        }, 60000);

        it('should convertToStkBNB', async () => {
            expect(
                (await readableInstance.convertToStkBNB(ethers.constants.WeiPerEther)).toBigInt(),
            ).toBeLessThanOrEqual(ethers.constants.WeiPerEther.toBigInt());
        }, 60000);

        it('should getClaims', async () => {
            await expect(
                readableInstance.getClaims(await writeProvider.getAddress()),
            ).resolves.toHaveLength(0);
        }, 60000);

        it('should getTvl', async () => {
            expect((await readableInstance.getTvl()).toBigInt()).toBeGreaterThanOrEqual(
                ethers.constants.Zero.toBigInt(),
            );
        }, 60000);

        it('should getApr', async () => {
            expect(await readableInstance.getApr(7)).toBeGreaterThanOrEqual(
                ethers.constants.Zero.toBigInt(),
            );
        }, 60000);

        it('should get stkBNB', () => {
            expect(readableInstance.stkBNB.address).toBe(netConfig.stkBNB);
        });

        it('should get stakePool', () => {
            expect(readableInstance.stakePool.address).toBe(netConfig.stakePool);
        });

        it('should get subgraph Url', () => {
            expect(readableInstance.subgraphUrl).toBe(netConfig.subgraphUrl);
        });
    });
}
