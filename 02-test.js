#!/usr/bin/env node
import node_util from 'node:util';
import node_child_process from 'node:child_process';
import node_process from 'node:process';

import { Logger } from './util/logger.js';

const childProcessExec = node_util.promisify(node_child_process.exec);
// const { stdin, stdout } = node_process;
const logger = new Logger();
await logger.init();

async function step02Test() {
    await logger.logScriptBegin('test');

    await logger.logSection('Run test suite', 'npx hardhat test');

    await logger.log('$ npx hardhat test', "\n...")

    const { stdout } = await childProcessExec('npx hardhat test');
    console.log(stdout);

    await logger.log('Test successful!');
}

step02Test().then(async () => {
    await logger.logScriptEnd('test');
}).catch(async (err) => {
    if (err.stdout || err.stderr) {
        await logger.logError('error', err.message);
        console.log(err.stdout);
        console.log(err.stderr);
    } else {
        await logger.logError('error');
        console.log(err);
    }
});
