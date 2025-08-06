#!/usr/bin/env node
import { Logger } from './util/logger.js';

const logger = new Logger();
await logger.init();

async function step01Compile() {
    await logger.logScriptBegin('compile');

    await logger.logSection('Run compiler', 'npx hardhat compile');

    await logger.logProcess('npx hardhat compile');

    await logger.log('Compliation successful!', 'check the "artifacts" directory to see compiled outputs.');
}

step01Compile().then(async () => {
    await logger.logScriptEnd('compile');
}).catch(async (err) => {
    await logger.logError('error', err);
});
