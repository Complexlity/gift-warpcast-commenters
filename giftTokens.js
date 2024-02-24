import { ethers, NonceManager } from "ethers";
import fs from "fs";

import { config } from "dotenv";
config();

function isNumber(inputAmount) {
  const amount = Number(inputAmount);
  return !isNaN(amount);
}

const NUMBER_OF_TOKENS = process.argv[2];
if (!isNumber(NUMBER_OF_TOKENS)) {
  throw new Error(
    "Enter the number of token you want to gift e.g node giftTokens.js 100"
  );
}

if (Number(NUMBER_OF_TOKENS) < 1) {
  throw new Error("number of tokens must be greater that 0");
}

const inputFile = process.argv[3] ?? process.env.DEFAULT_WINNERS_FILE;
if (!inputFile) {
  throw new Error(
    "You need an input file with addresses e.g. node giftTokens.js 100 winners.csv"
  );
}

// Degen is the default type
const CURRENT_TOKEN = "DEGEN";
const BASE_MAINNET_RPC = "https://mainnet.base.org/";
const DEGEN_CONTRACT_ADDRESS = "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed";

/*
Data structure to make this composable and accept multiple token types in future
*/
const tokens = {
  DEGEN: {
    mainnetRPC: BASE_MAINNET_RPC,
    contractAddress: DEGEN_CONTRACT_ADDRESS,
  },
};

const tokenDetails = tokens[CURRENT_TOKEN];
const addresses = fs.readFileSync(inputFile, "utf-8");
const recepients = addresses.split();
// console.log({ recepients })
console.log({ amount: NUMBER_OF_TOKENS, token: CURRENT_TOKEN });

// Your wallet private key
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  throw new Error("Add you account private key to .env");
}

const provider = new ethers.JsonRpcProvider(tokenDetails.mainnetRPC);

const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const abi = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function balanceOf(address addr) view returns (uint)",
  "function transfer(address to, uint amount)",
];

console.log("Initializing");
/* Test you have the right token address;
const symbol = await tokenContractWithProvider.symbol();
console.log({ symbol })
// The symbol should be the token symbol. e.g 'DEGEN'
*/
const tokenContractWithSigner = new ethers.Contract(
  tokenDetails.contractAddress,
  abi,
  signer
);

const amount = ethers.parseUnits(NUMBER_OF_TOKENS);
for await (const address of recepients) {
  console.log(`Sending ${NUMBER_OF_TOKENS} ${CURRENT_TOKEN} to ${address}`);
  const result = await tokenContractWithSigner
    .transfer(address, amount)
    .then((tx) => tx.wait());
  console.log(
    "Successful. View on Explorer",
    `https://basescan.org/tx/${result.hash}`
  );
}
