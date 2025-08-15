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
    quiet: true,
});
const logger = new Logger();
await logger.init();


process.once('SIGINT', async () => {
    await logger.logError('interact', 'sigint');
});
process.once('SIGTERM', async () => {
    await logger.logError('interact', 'sigterm');
});
async function step05Interact() {
    await logger.logScriptBegin('interact');

    await logger.logSection('Load deployment data');
    const counterDeploymentJsonStr =
        await node_fs.readFile(FILE_PATHS.counterDeploymentJson);
    const counterDeploymentJson = JSON.parse(counterDeploymentJsonStr);
    logger.log('Smart contract adddress', counterDeploymentJson.deployedAddress);
    const counterAbiStr =
        await node_fs.readFile(FILE_PATHS.counterAbi);
    const counterAbi = JSON.parse(counterAbiStr);
    const counterAbiFormatted = JSON.stringify(counterAbi.abi).slice(0, 96) + '...';
    logger.log('Smart contract ABI', counterAbiFormatted);

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
    const formattedScAbiUrl = logger.f.url(`https://testnet.blockscout.injective.network/address/${scAddress}?tab=contract_abi`);
    logger.log('Smart contract ABI', formattedScAbiUrl);

    await logger.logSection('Query smart contract');
    const counterValue1 = await counter.value();
    logger.log('Counter value (BEFORE transaction)', counterValue1);
    console.log('Note that the "n" after the number simply denotes that it is of type BigInt (and you can ignore it).');

    await logger.logSection('Transact smart contract');
    const incrementTx = await counter.increment(7, { gasPrice: 160e6, gasLimit: 2e6 });
    logger.log('Increment transaction hash', incrementTx.hash);
    setTimeout(() => {
        // print after a second so dev isn't getting bored/ impatient while waiting
        const explorerUrl = `https://testnet.blockscout.injective.network/tx/${incrementTx.hash}`;
        const explorerUrlAnsi = logger.f.url(explorerUrl);
        console.log('Transaction', explorerUrlAnsi);
    }, 1000);
    const incrementTxReceipt = await incrementTx.wait(1);
    logger.log('Increment transaction block number', incrementTxReceipt.blockNumber);

    await logger.logSection('Query smart contract again');
    const counterValue2 = await counter.value();
    logger.log('Counter value (AFTER transaction)', counterValue2);

    await logger.log('Interact completed!');

    await logger.logInfoBox(
        'What have we accomplished?',
        `
1. Connect to Injective Testnet over JSON-RPC and initialise a wallet
   - Using "JsonRpcProvider" from ethers.js
   - Using "Mnemonic" and "HDNodeWallet" from ethers.js
2. Connect to a smart contract
   - Using the ABI from the solc output in the compile step
   - Using the deployed adress saved to disk in the deployment step
3. Query the "value" property using a read invocation of the smart contract
   - This is its initial value
4. Invoke the "increment" function using a transaction (write invocation of the smart contract)
   - Obtain the transaction address
   - Open the block explorer URL, to view the transaction details
5. Query the "value" property again using a read invocation of the smart contract
   - Observe that the value the 2nd time around has increased from the initial value
   - This is because the transaction has caused the state of the smart contract to change
`,
    );
}

step05Interact().then(async () => {
    await logger.logScriptEnd('interact');
    console.log('To continue, run the following command for the next step:\n', logger.f.bold('./06-stats.js'));
}).catch(async (err) => {
    if (err.stdout || err.stderr) {
        await logger.logError('interact', err.message);
        console.log(err.stdout);
        console.log(err.stderr);
    } else {
        await logger.logError('interact', err.message);
        console.log(err);
    }
});
