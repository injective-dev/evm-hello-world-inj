#!/usr/bin/env node
import {
    HDNodeWallet as EthersHDNodeWallet,
    JsonRpcProvider as EthersJsonRpcProvider,
    Mnemonic as EthersMnemonic,
} from 'ethers';
import dotenv from 'dotenv';

import { Logger } from './util/logger.js';
import formatter from './util/formatter.js';

const { CHARS } = formatter;
const processEnv = {};
dotenv.config({
    processEnv,
    quiet: true,
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
    const addressUrl = logger.formatForTerminal(
        'url',
        `https://testnet.blockscout.injective.network/address/${address}`,
    );
    logger.log('Account in explorer:', ...addressUrl);
    const formattedAddress = logger.formatForTerminal('BOLD', address);
    const formattedHighlightForAddress = logger.formatForTerminal('HIGHLIGHTER', '← copy this');
    logger.log('EVM address of account', ...formattedAddress, ...formattedHighlightForAddress);
    const faucetUrl = logger.formatForTerminal(
        'url',
        'https://testnet.faucet.injective.network/',
    );
    const formattedHighlightForFaucetUrl = logger.formatForTerminal('HIGHLIGHTER', '← open this');
    logger.log(
        'Injective Testnet Faucet:',
        ...faucetUrl,
        ...formattedHighlightForFaucetUrl,
    );
    await logger.logInfoBoxWithoutWait(
        `${ CHARS.POINT_RIGHT }Instructions${ CHARS.POINT_LEFT }`, 
        `\n- Please copy the EVM address above (see "${ formattedHighlightForAddress[0] }")`,
        `\n- Cmd+Click/Ctrl+Click the faucet URL above (see "${ formattedHighlightForFaucetUrl[0] }")`,
        '\n- Request Testnet INJ *before* proceeding with the next step',
    );

    await logger.logSection('Continue after funding account');

    // check balance
    const rpcUrl = processEnv.INJ_TESTNET_RPC_URL;
    const rpcProvider = new EthersJsonRpcProvider(rpcUrl);

    const balance = await rpcProvider.getBalance(address);
    logger.log('Balance of deployer account', balance);

    // warning if funds are zero, allow proceeding to next step anyway
    if (balance <= 0n) {
        // const faucetUrl = logger.formatForTerminal('url', 'https://testnet.faucet.injective.network/');
        logger.log('Injective Testnet Faucet:', ...faucetUrl);
        logger.log(
            'Unfunded account',
            '\n',
            ...logger.formatForTerminal('ERROR', 'WARNING!'),
            'this account is not yet funded, please ensure that you have funded it before running ./03-deploy.js',
        )
    }

    await logger.log('Fund completed!');

    await logger.logInfoBox(
        'What have we accomplished?',
        `
1. Connect to Injective Testnet over JSON-RPC
   - Using "JsonRpcProvider" from ethers.js
2. Generate a new account
   - Using "Mnemonic" and "HDNodeWallet" from ethers.js
   - Using the BIP39 seed phrase stored in the .env file as input
3. Visit the Injective Testnet faucet
   - Paste the address of the new account
   - Wait for it to dispense, which is a transfer transaction
4. Perform a balance check for the account to ensure that it is funded
   - If the balance is zero, only warn
   - But do not error, to allow proceeding to the next step anyway
`,
    );
}

process.once('SIGINT', async () => {
    await logger.logError('fund', 'sigint');
});
process.once('SIGTERM', async () => {
    await logger.logError('fund', 'sigterm');
});
step00Fund().then(async () => {
    await logger.logScriptEnd('fund');
    console.log('To continue, run the following command for the next step:\n', ...logger.formatForTerminal('BOLD', './01-compile.js'));
}).catch(async (err) => {
    if (err.stdout || err.stderr) {
        await logger.logError('fund', err.message);
        console.log(err.stdout);
        console.log(err.stderr);
    } else {
        await logger.logError('fund', err.message);
        console.log(err);
    }
});
