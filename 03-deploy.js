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

const processEnv = {};
dotenv.config({
    processEnv,
});
const logger = new Logger();
await logger.init();

async function step03Deploy() {
    await logger.logScriptBegin('deploy');

    await logger.logSection('Check account funds');
    // work out what the EVM address of the account is
    const hdPath = "m/44'/60'/0'/0";
    const seedPhrase = processEnv.SEED_PHRASE;
    const mnemonic = EthersMnemonic.fromPhrase(seedPhrase);
    const hdWalletNode = EthersHDNodeWallet.fromMnemonic(mnemonic, hdPath);
    const hdWallet = hdWalletNode.derivePath('0');
    const address = hdWallet.address;
    logger.log('EVM address of deployer account', address);
    const addressUrl = logger.formatForTerminal('url', `https://blockscout.injective.network/address/${address}`);
    logger.log('Deployer account in explorer:', ...addressUrl);

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

    await logger.logProcess('npx hardhat run script/deploy.js --network inj_testnet');

    await logger.logSection('Load deployment data');
    const counterDeploymentJsonStr =
        await node_fs.readFile(FILE_PATHS.counterDeploymentJson);
    const counterDeploymentJson = JSON.parse(counterDeploymentJsonStr);
    const scAddress = counterDeploymentJson.deployedAddress;

    const explorerUrl = `https://testnet.blockscout.injective.network/address/${scAddress}?tab=contract`;
    const explorerUrlAnsi = logger.formatForTerminal('url', explorerUrl);
    await logger.log('Deploy successful!', ...explorerUrlAnsi);
}

step03Deploy().then(async () => {
    await logger.logScriptEnd('deploy');
    console.log('To continue, run the following command for the next step:\n./04-verify.js');
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
