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
    console.log('To continue, run the following command for the next step:\n./03-deploy.js');
}).catch(async (err) => {
    if (err.stdout || err.stderr) {
        await logger.logError('test', err.message);
        console.log(err.stdout);
        console.log(err.stderr);
    } else {
        await logger.logError('test');
        console.log(err);
    }
});
