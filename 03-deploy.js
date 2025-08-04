#!/usr/bin/env node
import node_util from 'node:util';
import node_child_process from 'node:child_process';

import {
    HDNodeWallet as EthersHDNodeWallet,
    JsonRpcProvider as EthersJsonRpcProvider,
    Mnemonic,
} from 'ethers';
import dotenv from 'dotenv';

import { Logger } from './util/logger.js';

const childProcessExec = node_util.promisify(node_child_process.exec);
const processEnv = {};
dotenv.config({
    processEnv,
});
const logger = new Logger();
await logger.init();

async function step03Deploy() {
    await logger.logScriptBegin('deploy');

    await logger.logSection('Fund account');
    // work out what the EVM address of the account is
    const hdPath = "m/44'/60'/0'/0";
    const seedPhrase = processEnv.SEED_PHRASE;
    const mnemonic = Mnemonic.fromPhrase(seedPhrase);
    const hdWalletNode = EthersHDNodeWallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0");
    const hdWallet = hdWalletNode.derivePath('0');
    const address = hdWallet.address;
    logger.log('EVM address of deployer account', address);

    // check what its funds are
    const rpcUrl = processEnv.INJ_TESTNET_RPC_URL;
    const rpcProvider = new EthersJsonRpcProvider(rpcUrl);
    const balance = await rpcProvider.getBalance(address);
    logger.log('Balance of deployer account', balance);

    // error if funds are zero, otherwise proceeed to next step
    if (balance <= 0n) {
        const faucetUrl = logger.formatForTerminal('url', 'https://testnet.faucet.injective.network/');
        logger.log('Injective Testnet Faucet:', ...faucetUrl);
        throw new Error('Account needs to be funded to continue')
    }

    await logger.logSection('Run deploy script', 'npx hardhat run script/deploy.js --network inj_testnet');

    await logger.log('$ npx hardhat run script/deploy.js --network inj_testnet', "\n...")

    const { stdout } = await childProcessExec('npx hardhat run script/deploy.js --network inj_testnet');
    console.log(stdout);

    await logger.log('Test successful!');
}

step03Deploy().then(async () => {
    await logger.logScriptEnd('deploy');
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
