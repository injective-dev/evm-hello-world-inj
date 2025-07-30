#!/usr/bin/env node
import readline from 'node:readline/promises';
import node_process from 'node:process';
import fs from 'node:fs/promises';

import dotenv from 'dotenv';
import bip39 from 'bip39';

const { stdin, stdout } = node_process;
import { Logger } from './logger.js';
import formatter from './formatter.js';
import FILE_PATHS from './file-paths.js';

const logger = new Logger();

async function promptUser() {
    const env = {};
    dotenv.config({
        path: FILE_PATHS.dotEnv,
        processEnv: env,
    });
    const configJsonStr = await fs.readFile(
        FILE_PATHS.configJson,
    );
    const configJson = JSON.parse(configJsonStr);

    let {
        SEED_PHRASE,
    } = env;
    let {
        rpcUrl,
    } = configJson;

    while (true) {
        logger.logSection('Please enter the requested values to populate your .env and other config files.');

        env.SEED_PHRASE = await promptSeedPhrase(SEED_PHRASE);
        configJson.rpcUrl = await promptRpcUrl(rpcUrl);

        if (
            env.SEED_PHRASE &&
            configJson.rpcUrl
        ) {
            break;
        }
    }

    console.log('env', env);
    console.log('configJson', configJson);
    return {
        env,
        configJson,
    };
}

async function updateFiles({ env, configJson }) {
    const dotEnvStr = `
SEED_PHRASE="${env.SEED_PHRASE}"
`;
    await fs.writeFile(
        FILE_PATHS.dotEnv,
        dotEnvStr,
    );
    console.log('Env vars written.', FILE_PATHS.dotEnv);

    const configJsonStr = JSON.stringify(configJson, undefined, 2);
    await fs.writeFile(
        FILE_PATHS.configJson,
        configJsonStr,
    );
    console.log('Env vars written.', FILE_PATHS.configJson);
}

async function promptSeedPhrase(seedPhrase) {
    let valid = false;
    logger.log('Enter a BIP-39 seed phrase');
    while (!valid) {
        if (seedPhrase) {
            logger.log(`Current: "${seedPhrase}"`);
            logger.log('(enter blank to re-use the above value)');
        } else {
            logger.log('(enter "new" value generate a new one at random)');
        }
        const rlPrompt = readline.createInterface({
            input: stdin,
            output: stdout,
        });
        const inputSeedPhrase = await rlPrompt.question('> ');
        rlPrompt.close();
        if (inputSeedPhrase === 'new') {
            // generate seed phrase if none is input
            seedPhrase = bip39.generateMnemonic(128);
        } else if (inputSeedPhrase) {
            // use the input seed phrase
            seedPhrase = inputSeedPhrase;
        }

        // validate seed phrase
        valid = bip39.validateMnemonic(seedPhrase);

        if (!valid) {
            logger.logError('Invalid BIP-39 seed phrase, please try again.', seedPhrase);
        }
    }

    return seedPhrase;
}

async function promptRpcUrl(rpcUrl) {
    let valid = false;
    logger.log('Enter a JSON-RPC URL endpoint');
    while (!valid) {
        if (rpcUrl) {
            logger.log(`Current: "${rpcUrl}"`);
            logger.log('(enter blank to re-use the above value)');
        } else {
            logger.log('(enter "new" to use the default value)');
        }
        const rlPrompt = readline.createInterface({
            input: stdin,
            output: stdout,
        });
        const input = await rlPrompt.question('> ');
        rlPrompt.close();
        if (input === 'new') {
            // use default if none is input
            rpcUrl = 'https://k8s.testnet.json-rpc.injective.network/';
        } else if (input) {
            // use the input value
            rpcUrl = input;
        }

        // validate RPC URL
        valid = rpcUrl.match(/^https?\:\/\/.*$/);

        if (!valid) {
            logger.logError('Invalid RPC URL, please try again.', rpcUrl);
        }
    }

    return rpcUrl;
}

async function initDotEnv() {
    const results = await promptUser();
    await updateFiles(results);
}

initDotEnv();
