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

    // check balance (1st time)
    let balance = await rpcProvider.getBalance(address);
    logger.log('Balance of account', balance);

    // if funds are zero, wait for an additional 30s before checking again
    if (balance <= 0n) {
        logger.log('Waiting 30s before checking balance again...');
        await logger.delay(30e3);

        // check balance (2nd time)
        balance = await rpcProvider.getBalance(address);
        logger.log('Balance of account, 2nd attempt', balance);

        // error if funds are zero, otherwise proceeed to next step
        if (balance <= 0n) {
            throw new Error(
                'Account needs to be funded to continue. ' +
                'Please repeat the funding step: ./00-fund.js',
            );
        }
    }

    await logger.logSection('Run deploy script', ...logger.formatForTerminal('ITALIC', 'npx hardhat run script/deploy.js --network inj_testnet'));

    await logger.logProcess('npx hardhat run script/deploy.js --network inj_testnet');

    await logger.log('Deploy completed!');

    await logger.logSection('Load deployment data');
    const counterDeploymentJsonStr =
        await node_fs.readFile(FILE_PATHS.counterDeploymentJson);
    const counterDeploymentJson = JSON.parse(counterDeploymentJsonStr);
    const scAddress = counterDeploymentJson.deployedAddress;

    const explorerUrl = `https://testnet.blockscout.injective.network/address/${scAddress}?tab=contract_bytecode`;
    const explorerUrlAnsi = logger.formatForTerminal('url', explorerUrl);
    await logger.log('Smart contract', ...explorerUrlAnsi);

    await logger.logInfoBox(
        'What have we accomplished?',
        `
1. Connect to Injective Testnet over JSON-RPC
   - Using "JsonRpcProvider" from ethers.js
2. Perform a balance check for the account to ensure that it is funded
   - Using "Mnemonic" and "HDNodeWallet" from ethers.js
3. Send a deployment transaction, via a hardhat script, for the Counter smart contract
4. Inspect the result of the deployment transaction
   - Obtain the smart contract address
   - Open the block explorer URL, to view the deployed EVM bytecode
`,
    );
}

step03Deploy().then(async () => {
    await logger.logScriptEnd('deploy');
    console.log('To continue, run the following command for the next step:\n', ...logger.formatForTerminal('BOLD', './04-verify.js'));
}).catch(async (err) => {
    if (err.stdout || err.stderr) {
        await logger.logError('deploy', err.message);
        console.log(err.stdout);
        console.log(err.stderr);
    } else {
        await logger.logError('deploy', err.message);
        console.log(err);
    }
});
