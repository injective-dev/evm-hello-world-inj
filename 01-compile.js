#!/usr/bin/env node
import node_util from 'node:util';
import node_child_process from 'node:child_process';
import node_process from 'node:process';

import { Logger } from './util/logger.js';

const childProcessExec = node_util.promisify(node_child_process.exec);
const { stdin, stdout } = node_process;
const logger = new Logger();
await logger.init();

async function step01Compile() {
    await logger.logScriptBegin('compile');

    await logger.logSection('Run compiler', 'npx hardhat compile');

    await logger.log('$ npx hardhat compile', "\n...")
    await childProcessExec('npx hardhat compile', { stdout, stdin });

    await logger.log('Compliation successful!', 'check the "artifacts" directory to see compiled outputs.');
}

step01Compile().then(async () => {
    await logger.logScriptEnd('compile');
}).catch(async (err) => {
    await logger.logError('error', err);
});
