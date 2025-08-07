#!/usr/bin/env node
import node_fs from 'node:fs/promises';

import {
    HDNodeWallet as EthersHDNodeWallet,
    JsonRpcProvider as EthersJsonRpcProvider,
    Mnemonic as EthersMnemonic,
} from 'ethers';
import dotenv from 'dotenv';

import FILE_PATHS from './util/file-paths.js';
import { Logger } from './util/logger.js';
import { resolve } from 'node:path';

const processEnv = {};
dotenv.config({
    processEnv,
});
const logger = new Logger();
await logger.init();

async function step00Fund() {
    await logger.logScriptBegin('fund');

    await logger.logSection('Account lookup');
    // work out what the EVM address of the account is
    const hdPath = "m/44'/60'/0'/0";
    const seedPhrase = processEnv.SEED_PHRASE;
    const mnemonic = EthersMnemonic.fromPhrase(seedPhrase);
    const hdWalletNode = EthersHDNodeWallet.fromMnemonic(mnemonic, hdPath);
    const hdWallet = hdWalletNode.derivePath('0');
    const address = hdWallet.address;
    logger.log('EVM address of account', address);
    const addressUrl = logger.formatForTerminal('url', `https://blockscout.injective.network/address/${address}`);
    logger.log('Account in explorer:', ...addressUrl);
    const faucetUrl = logger.formatForTerminal('url', 'https://testnet.faucet.injective.network/');
    logger.log('Injective Testnet Faucet:', ...faucetUrl);

    await logger.logSection('Continue after funding account');

    // check what its funds are
    const rpcUrl = processEnv.INJ_TESTNET_RPC_URL;
    const rpcProvider = new EthersJsonRpcProvider(rpcUrl);

    let balance = await rpcProvider.getBalance(address);
    logger.log('Balance of account', balance);

    // if funds are zero, wait for an additional 30s before checking again
    if (balance <= 0n) {
        logger.log('Waiting 30s before checking balance again...');
        await new Promise((resolve) => { setTimeout(resolve, 30e3); });

        balance = await rpcProvider.getBalance(address);
        logger.log('Balance of account, 2nd attempt', balance);

        // error if funds are zero, otherwise proceeed to next step
        if (balance <= 0n) {
            throw new Error('Account needs to be funded to continue');
        }
    }

    await logger.log('Fund successful!');
}

step00Fund().then(async () => {
    await logger.logScriptEnd('fund');
    console.log('To continue, run the following command for the next step:\n./01-compile.js');
}).catch(async (err) => {
    if (err.stdout || err.stderr) {
        await logger.logError('error', err.message);
        console.log(err.stdout);
        console.log(err.stderr);
    } else {
        await logger.logError('error', err.message);
        console.log(err);
    }
});
