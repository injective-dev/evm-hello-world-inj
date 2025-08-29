#!/usr/bin/env node
import fs from 'node:fs/promises';

import dotenv from 'dotenv';
import bip39 from 'bip39';

import { Logger } from './logger.js';
import FILE_PATHS from './file-paths.js';

const logger = new Logger();
await logger.init();

async function promptUser() {
    const env = {};
    dotenv.config({
        path: FILE_PATHS.dotEnv,
        processEnv: env,
        quiet: true,
    });

    let {
        SEED_PHRASE,
        INJ_TESTNET_RPC_URL,
    } = env;

    while (true) {
        logger.logSectionWithoutWait('Please enter the requested values to populate your .env and other config files.');

        env.SEED_PHRASE = await promptInput(SEED_PHRASE, {
            inputName: 'BIP39 seed phrase',
            defaultValueFn: () => (bip39.generateMnemonic(128)),
            validateValueFn: (value) => (bip39.validateMnemonic(value)),
        });
        env.INJ_TESTNET_RPC_URL = await promptInput(INJ_TESTNET_RPC_URL, {
            inputName: 'JSON-RPC endpoint URL',
            defaultValueFn: () => ('https://k8s.testnet.json-rpc.injective.network/'),
            validateValueFn: (value) => (typeof value === 'string' && value.match(/^https?\:\/\/.*$/)),
        });

        if (
            env.SEED_PHRASE &&
            env.INJ_TESTNET_RPC_URL
        ) {
            break;
        }
    }

    console.log('env', env);
    console.log('configJson', logger.configJson);

    await logger.loggerJumpToFileLine(FILE_PATHS.configJson);
    await logger.loggerJumpToFileLine(FILE_PATHS.dotEnv);

    return {
        env,
        configJson: logger.configJson,
    };
}

async function updateFiles({ env, configJson }) {
    const dotEnvStr = `
SEED_PHRASE="${env.SEED_PHRASE}"
INJ_TESTNET_RPC_URL="${env.INJ_TESTNET_RPC_URL}"
`;
    await fs.writeFile(
        FILE_PATHS.dotEnv,
        dotEnvStr,
    );
    console.log('env vars written.', FILE_PATHS.dotEnv);
}

async function promptInput(value, {
    inputName,
    defaultValueFn,
    validateValueFn,
}) {
    let valid = false;
    logger.log(`Enter value for ${inputName}`);
    const highlightedNew = logger.f.highlighter('new');
    while (!valid) {
        if (value) {
            console.log(
                `Current: "${value}"\n`,
                '(enter blank to re-use the above value)\n',
                `(OR enter \'${ highlightedNew }\' to use a default value or generate a new value)`,
            );
        } else {
            console.log(`(enter \'${ highlightedNew }\' to use a default value or generate a new value)`);
        }
        const inputValue = await logger.askQuestion();
        if (inputValue === 'new') {
            // generate seed phrase if none is input
            value = defaultValueFn();
        } else if (inputValue) {
            // use the input seed phrase
            value = inputValue;
        }

        // validate seed phrase
        valid = validateValueFn(value);

        if (!valid) {
            logger.logError('setup', 'Invalid BIP-39 seed phrase, please try again.', value);
        }
    }

    return value;
}

process.once('SIGINT', async () => {
    await logger.logError('setup', 'sigint');
});
process.once('SIGTERM', async () => {
    await logger.logError('setup', 'sigterm');
});

async function initDotEnv() {
    const results = await promptUser();
    await updateFiles(results);

    logger.flush(true);
}

initDotEnv();
