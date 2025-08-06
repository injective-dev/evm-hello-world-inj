#!/usr/bin/env node
import { Logger } from './util/logger.js';

const logger = new Logger();
await logger.init();

async function step02Test() {
    await logger.logScriptBegin('test');

    await logger.logSection('Run test suite', 'npx hardhat test');

    await logger.logProcess('npx hardhat test');

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
