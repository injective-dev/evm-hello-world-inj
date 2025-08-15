import path from 'node:path';
import url from 'node:url';

const { fileURLToPath } = url;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_PATHS = {
    dotEnv: path.resolve(__dirname, '../.env'),
    configJson: path.resolve(__dirname, '../config.json'),
    packageJson: path.resolve(__dirname, '../package.json'),
    logs: path.resolve(__dirname, '../logs.json.txt'),
    gitRefsHeadMain: path.resolve(__dirname, '../.git/refs/heads/main'),
    counterDeploymentJson: path.resolve(__dirname, '../cache/Counter.deployment.json'),
    counterAbi: path.resolve(__dirname, '../artifacts/contracts/Counter.sol/Counter.json'),
    counterTest: path.resolve(__dirname, '../test/Counter.test.js'),
    counterSol: path.resolve(__dirname, '../contracts/Counter.sol'),
};

export default FILE_PATHS;
