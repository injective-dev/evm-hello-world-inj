const { expect } = require('chai');

describe('Counter', function () {
  let counter;

  before(async function () {
    Counter = await ethers.getContractFactory('Counter');
    counter = await Counter.deploy();
    await counter.waitForDeployment();
  });

  it('should start with a count of 0', async function () {
    expect(await counter.value()).to.equal(0);
  });

  it('should increment the count starting from zero', async function () {
    await counter.increment(100);
    expect(await counter.value()).to.equal(100);
  });

  it('should increment the count starting from non-zero', async function () {
    await counter.increment(23);
    expect(await counter.value()).to.equal(123);
  });
});
