#!/usr/bin/env node

import { Logger } from './logger.js';

const logger = new Logger();
await logger.init();
logger.logSetupBegin('setup', 'Hello World!');
logger.flush(true);
