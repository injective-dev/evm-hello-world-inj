import '@nomicfoundation/hardhat-toolbox';
import dotenv from 'dotenv';

dotenv.config({
    quiet: true,
});

let accounts;
if (process.env.PRIVATE_KEY) {
  accounts = [process.env.PRIVATE_KEY];
}
else if (process.env.SEED_PHRASE) {
  accounts = {
    mnemonic: process.env.SEED_PHRASE,
    path: "m/44'/60'/0'/0",
    initialIndex: 0,
    count: 5,
  };
} else {
  accounts = [];
}

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: '0.8.28',
  networks: {
    inj_testnet: {
      url: process.env.INJ_TESTNET_RPC_URL || 'https://k8s.testnet.json-rpc.injective.network/',
      accounts,
      chainId: 1439,
    },
  },
  etherscan: {
    apiKey: {
      inj_testnet: 'nil',
    },
    customChains: [
      {
        network: 'inj_testnet',
        chainId: 1439,
        urls: {
          apiURL: 'https://testnet.blockscout-api.injective.network/api',
          browserURL: 'https://testnet.blockscout.injective.network/',
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};
