#!/usr/bin/env node
import dotenv from 'dotenv';

import { Logger } from './util/logger.js';

const processEnv = {};
dotenv.config({
    processEnv,
});
const logger = new Logger();
await logger.init();

async function step06Stats() {
    await logger.logScriptBegin('stats');

    const logs = await logger.logsLoad();
    logger.log('Read log lines', logs.length);

    const logsSummary = await logger.logsSummary(logs);
    console.log(logsSummary.summaryText);

    await logger.log('Stats successful!');
}

step06Stats().then(async () => {
    await logger.logScriptEnd('stats');
    console.log('You have completed all the steps!');
}).catch(async (err) => {
    if (err.stdout || err.stderr) {
        await logger.logError('stats', err.message);
        console.log(err.stdout);
        console.log(err.stderr);
    } else {
        await logger.logError('stats', err.message);
        console.log(err);
    }
});
