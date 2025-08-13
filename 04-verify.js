#!/usr/bin/env node
import node_fs from 'node:fs/promises';

import dotenv from 'dotenv';

import FILE_PATHS from './util/file-paths.js';
import { Logger } from './util/logger.js';

const processEnv = {};
dotenv.config({
    processEnv,
});
const logger = new Logger();
await logger.init();

async function step04Verify() {
    await logger.logScriptBegin('verify');

    await logger.logSection('Load deployment data');
    const counterDeploymentJsonStr =
        await node_fs.readFile(FILE_PATHS.counterDeploymentJson);
    const counterDeploymentJson = JSON.parse(counterDeploymentJsonStr);
    console.log(counterDeploymentJson);

    await logger.logSection('Verify smart contract', ...logger.formatForTerminal('ITALIC', 'npx hardhat verify --network inj_testnet ${SC_ADDRESS}'));
    await logger.loggerJumpToFileLine(FILE_PATHS.counterSol);

    const scAddress = counterDeploymentJson.deployedAddress;
    const command = `npx hardhat verify --force --network inj_testnet ${scAddress}`;
    await logger.logProcess(command);

    const explorerUrl = `https://testnet.blockscout.injective.network/address/${scAddress}?tab=contract_source_code`;
    const explorerUrlAnsi = logger.formatForTerminal('url', explorerUrl);
    await logger.log('Verify successful!', ...explorerUrlAnsi);
}

step04Verify().then(async () => {
    await logger.logScriptEnd('verify');
    console.log('To continue, run the following command for the next step:\n', ...logger.formatForTerminal('BOLD', './05-interact.js'));
}).catch(async (err) => {
    if (err.stdout || err.stderr) {
        await logger.logError('verify', err.message);
        console.log(err.stdout);
        console.log(err.stderr);
    } else {
        await logger.logError('verify', err.message);
        console.log(err);
    }
});
