#!/usr/bin/env node
import { Logger } from './util/logger.js';
import FILE_PATHS from './util/file-paths.js';

const logger = new Logger();
await logger.init();

async function step01Compile() {
    await logger.logScriptBegin('compile');

    await logger.logSection('Run compiler', ...logger.formatForTerminal('ITALIC', 'npx hardhat compile'));

    await logger.logProcess('npx hardhat compile');

    await logger.loggerJumpToFileLine(FILE_PATHS.counterAbi);

    await logger.log('Compilation completed!', 'check the "artifacts" directory to see compiled outputs.');

    await logger.logInfoBox(
        'What have we accomplished?',
        `
1. Install the version of solc needed by the project.
   (automatic via hardhat)
2. Run solc, via hardhat, using the Counter.sol file as input.
3. Observe the outputs produced by solc:
   - EVM bytecode (hexadecimal)
   - EVM ABI (JSON)
`
    );
}

step01Compile().then(async () => {
    await logger.logScriptEnd('compile');
    console.log('To continue, run the following command for the next step:\n', ...logger.formatForTerminal('BOLD', './02-test.js'));
}).catch(async (err) => {
    if (err.stdout || err.stderr) {
        await logger.logError('compile', err.message);
        console.log(err.stdout);
        console.log(err.stderr);
    } else {
        await logger.logError('compile', err.message);
        console.log(err);
    }
});
