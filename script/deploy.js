async function main() {
    const Counter = await ethers.getContractFactory('Counter');
    const counter = await Counter.deploy({
        gasPrice: 160e6,
        gasLimit: 2e6,
    });
    await counter.waitForDeployment();
    const address = await counter.getAddress();

    console.log('Counter smart contract deployed to:', address);
}

main()
    .then(() => {
        console.log('Deployment script executed successfully.');
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
