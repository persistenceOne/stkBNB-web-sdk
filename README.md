# stkBNB-web-sdk

[![npm (tag)](https://img.shields.io/npm/v/@persistenceone/stkbnb-web-sdk)](https://www.npmjs.com/package/@persistenceone/stkbnb-web-sdk)
[![CI](https://github.com/persistenceOne/stkBNB-web-sdk/workflows/CI/badge.svg?branch=main)](https://github.com/persistenceOne/stkBNB-web-sdk/actions?query=workflow%3A%22CI%22)
![Codecov](https://img.shields.io/codecov/c/github/persistenceOne/stkBNB-web-sdk)
![Libraries.io dependency status for GitHub repo](https://img.shields.io/librariesio/github/persistenceOne/stkBNB-web-sdk)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://github.com/persistenceOne/stkBNB-web-sdk/blob/main/LICENSE)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://github.com/persistenceOne/stkBNB-web-sdk/blob/main/CODE_OF_CONDUCT.md)

SDK that makes integrating with stkBNB extremely easy.

### Install

#### yarn

```shell
yarn add @persistenceone/stkbnb-web-sdk
```

#### npm

```shell
npm i @persistenceone/stkbnb-web-sdk
```

### Usage

For detailed usage examples, please refer the typedocs on the lib functions. A few examples are
given here:

#### Get stkBNB Balance

```ts
import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";

const sdk = StkBNBWebSDK.getInstance();
const user: string = '...'; // address of some user
const balance = await sdk.stkBNB.balanceOf(user);
console.log(`stkBNB.balanceOf(${user}) = ${StkBNBWebSDK.format(balance)} stkBNB`);
```

#### Stake

```ts
import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
import { ethers } from 'ethers';

const sdk = StkBNBWebSDK.getInstance({ signerOrProvider: ... }); // just provide the signer here
const { transactionHash } = await sdk.stake(ethers.constants.WeiPerEther); // stake 1 BNB
```

#### Unstake

```ts
import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";
import { ethers } from 'ethers';

const sdk = StkBNBWebSDK.getInstance({ signerOrProvider: ... }); // just provide the signer here
const { transactionHash } = await sdk.unstake(ethers.constants.WeiPerEther); // unstake 1 stkBNB
```

#### Claim

```ts
import { StkBNBWebSDK } from "@persistenceone/stkbnb-web-sdk";

const sdk = StkBNBWebSDK.getInstance({ signerOrProvider: ... }); // just provide the signer here
const { transactionHash } = await sdk.claimAll(); // will claim all the requests for which cooldown period has finished
```
