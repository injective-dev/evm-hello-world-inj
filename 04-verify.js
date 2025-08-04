#!/usr/bin/env node
import node_util from 'node:util';
import node_child_process from 'node:child_process';
import node_fs from 'node:fs/promises';

import dotenv from 'dotenv';

import FILE_PATHS from './util/file-paths.js';
import { Logger } from './util/logger.js';

const childProcessExec = node_util.promisify(node_child_process.exec);
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

    await logger.logSection('Verify smart contract', 'npx hardhat verify --network inj_testnet ${SC_ADDRESS}');

    const scAddress = counterDeploymentJson.deployedAddress;
    const command = `npx hardhat verify --network inj_testnet ${scAddress}`;
    await logger.log(`$ ${command}`, "\n...")

    const { stdout } = await childProcessExec(command);
    console.log(stdout);

    await logger.log('Verify successful!');
}

step04Verify().then(async () => {
    await logger.logScriptEnd('verify');
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
