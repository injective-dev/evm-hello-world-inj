#!/usr/bin/env node
import readline from 'node:readline/promises';
import node_process from 'node:process';

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

    let {
        SEED_PHRASE,
    } = env;

    while (true) {
        logger.logSection('Please enter the requested values to populate your .env and other config files.');

        env.SEED_PHRASE = await promptSeedPhrase(SEED_PHRASE);

        if (env.SEED_PHRASE) {
            break;
        }
    }

    console.log('env', env);
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

promptUser();
