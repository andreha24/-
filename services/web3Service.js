import { ethers } from "ethers";
import contractABI from "../contracts/DigitalLibrary.json" with { type: "json" };

let provider;
let contract;
let wallet;

export async function initializeWeb3() {
  try {
        provider = new ethers.InfuraProvider(
      process.env.ETHEREUM_NETWORK,
      process.env.INFURA_PROJECT_ID
    );

        wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

        contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractABI,
      wallet
    );
  } catch (error) {
    throw error;
  }
}

export async function registerBook(title, author, price, contentHash) {
  try {
    const tx = await contract.registerBook(title, author, price, contentHash);
    const receipt = await tx.wait();
        const eventLog = receipt.logs.find(
      (log) => log.fragment.name === "BookRegistered"
    );
    return Number(eventLog.args[0]);
  } catch (error) {
    throw error;
  }
}

export async function buyBook(bookId, value) {
  try {
    const tx = await contract.buyBook(bookId, { value });
    return await tx.wait();
  } catch (error) {
    throw error;
  }
}

export async function setBookAvailability(id, isAvailable) {
  try {
    const tx = await contract.setBookAvailability(id, isAvailable);
    return await tx.wait();
  } catch (error) {
    throw error;
  }
}

export async function setBookPrice(id, price) {
  try {
    const tx = await contract.setBookPrice(id, price);
    return await tx.wait();
  } catch (error) {
    throw error;
  }
}

export async function getBook(bookId) {
  try {
    return await contract.getBook(bookId);
  } catch (error) {
    throw error;
  }
}

export async function checkCanDownloadBook(bookId) {
  try {
    return await contract.canDownloadBook(bookId);
  } catch (error) {
    throw error;
  }
}