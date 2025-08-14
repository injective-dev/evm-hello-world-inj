#!/usr/bin/env node
import { Logger } from './logger.js';

const logger = new Logger();
await logger.init();

async function setupComplete() {
    await logger.logInfoBoxWithoutWait(
        'What have we accomplished?',
        `
1. Initialise empty versions of .env and config.json files
2. Interactive prompts to input (or use defaults) for values to be used in this projects
   - BIP39 seed phrase (used to generate accounts)
   - JSON-RPC endpoint URL (used to communicate with the network)
3. Install dependencies
   - Ran in the background during interactive prompts
`,
    );

}

setupComplete().then(async () => {
    await logger.logSetupEnd('setup', 'Set up complete!');
    console.log(
        'To begin, run the following command for the first step:\n',
        ...logger.formatForTerminal('BOLD', './00-fund.js'),
    );
}).catch(async (err) => {
    if (err.stdout || err.stderr) {
        await logger.logError('setup', err.message);
        console.log(err.stdout);
        console.log(err.stderr);
    } else {
        await logger.logError('setup', err.message);
        console.log(err);
    }
});
