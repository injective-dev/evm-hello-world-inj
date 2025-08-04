import fs from 'node:fs/promises';

import FILE_PATHS from '../util/file-paths.js';

async function deploy() {
    const [defaultSigner] = await ethers.getSigners();
    const defaultSignerAddress = await defaultSigner.getAddress();
    console.log('defaultSignerAddress', defaultSignerAddress);

    const Counter = await ethers.getContractFactory('Counter');
    const counter = await Counter.deploy({
        gasPrice: 160e6,
        gasLimit: 2e6,
    });
    await counter.waitForDeployment();
    const txHash = (await counter.deploymentTransaction()).hash;
    const address = await counter.getAddress();

    console.log('Counter smart contract deployed to:', address);

    const deploymentData = {
        deployedAddress: address,
        deploymentTx: txHash,
    };
    const deploymentDataStr = JSON.stringify(deploymentData, undefined, 2);
    await fs.writeFile(FILE_PATHS.counterDeploymentJson, deploymentDataStr);
}

deploy()
    .then(() => {
        console.log('Deployment script executed successfully.');
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
