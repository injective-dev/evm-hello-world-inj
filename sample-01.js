#!/usr/bin/env node

import { Logger } from './util/logger.js';

const logger = new Logger();
await logger.init();

async function sample01() {
    await logger.logScriptBegin('Start Sample01');

    await logger.logSection('A 1st section', 'foo', 123);

    await logger.log('a 1st regular log');

    await logger.logSection('A 2nd section', 'bar', 456);

    const someUrl = logger.formatForTerminal('URL', 'https://docs.injective.network/');
    await logger.log('a 2nd regular log', ...someUrl);

    await logger.logScriptEnd('Complete Sample01');
}

sample01();
