#!/usr/bin/env node
import node_fs from 'node:fs/promises';

import {
    HDNodeWallet as EthersHDNodeWallet,
    JsonRpcProvider as EthersJsonRpcProvider,
    Mnemonic as EthersMnemonic,
    Contract as EthersContract,
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

async function step05Interact() {
    await logger.logScriptBegin('interact');

    await logger.logSection('Load deployment data');
    const counterDeploymentJsonStr =
        await node_fs.readFile(FILE_PATHS.counterDeploymentJson);
    const counterDeploymentJson = JSON.parse(counterDeploymentJsonStr);
    console.log(counterDeploymentJson);
    const counterAbiStr =
        await node_fs.readFile(FILE_PATHS.counterAbi);
    const counterAbi = JSON.parse(counterAbiStr);
    console.log(counterAbi.abi);

    await logger.logSection('Initialise RPC provider and signer');
    const hdPath = "m/44'/60'/0'/0";
    const seedPhrase = processEnv.SEED_PHRASE;
    const mnemonic = EthersMnemonic.fromPhrase(seedPhrase);
    const hdWalletNode = EthersHDNodeWallet.fromMnemonic(mnemonic, hdPath);
    const hdWallet = hdWalletNode.derivePath('0');
    const accountAddress = hdWallet.address;
    logger.log('account address', accountAddress);

    const rpcUrl = processEnv.INJ_TESTNET_RPC_URL;
    const rpcProvider = new EthersJsonRpcProvider(rpcUrl);

    await logger.logSection('Initialise smart contract');
    const scAddress = counterDeploymentJson.deployedAddress;
    const scAbi = counterAbi.abi;
    const connectedHdWallet = hdWallet.connect(rpcProvider);
    const counter = new EthersContract(scAddress, scAbi, connectedHdWallet);

    await logger.logSection('Query smart contract');
    const counterValue1 = await counter.value();
    logger.log('counterValue1', counterValue1);

    await logger.logSection('Transact smart contract');
    const incrementTx = await counter.increment(1, { gasPrice: 160e6, gasLimit: 2e6 });
    logger.log('incrementTx.hash', incrementTx.hash);

    await logger.logSection('Query smart contract again');
    const counterValue2 = await counter.value();
    logger.log('counterValue2', counterValue2);

    await logger.log('Interact successful!');
}

step05Interact().then(async () => {
    await logger.logScriptEnd('interact');
    console.log('To continue, run the following command for the next step:\n./06-stats.js');
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
