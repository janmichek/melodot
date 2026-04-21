import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.warn(
    "⚠️  WARNING: PRIVATE_KEY environment variable not found. Please set it in your .env file for network deployments."
  );
}

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  resolc: {
    compilerSource: "npm",
    settings: {},
  },
  networks: {
    polkadotTestnet: {
      url: "https://services.polkadothub-rpc.com/testnet",
      chainId: 420420417,
      accounts: privateKey ? [privateKey] : [],
    },
  },
};

export default config;
