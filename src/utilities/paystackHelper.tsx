// utilities/paystackHelper.js
import axios from "axios";

const PAYSTACK_SECRET_KEY = import.meta.env.VITE_PAYSTACK_SECRET_KEY;

/**
 * Fetch supported banks from Paystack
 */
export const fetchPaystackBanks = async () => {
  try {
    const response = await axios.get("https://api.paystack.co/bank", {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    if (response.data.status && Array.isArray(response.data.data)) {
      return response.data.data; // array of banks
    } else {
      throw new Error("Failed to fetch Paystack banks");
    }
  } catch (error) {
    console.error("Error fetching Paystack banks:", error);
    return [];
  }
};

/**
 * Resolves bank account number to get account name.
 * @param {string} accountNumber - The 10-digit account number to resolve.
 * @param {string} bankCode - The bank code for the account.
 * @returns {Promise<object|null>} - The resolved account data (e.g., { account_name, account_number }) or null on failure.
 */
export const resolveAccountNumber = async (accountNumber: string, bankCode:string) => {
  if (!accountNumber || !bankCode || accountNumber.length !== 10) {
    return null;
  }
  
  try {
    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.data.status && response.data.data) {
      return response.data.data; 
    } else {
      throw new Error(response.data.message || "Failed to resolve account");
    }
  } catch (error: any) {
    console.error("Error resolving Paystack account:", error.response?.data?.message || error.message);
    return null;
  }
};