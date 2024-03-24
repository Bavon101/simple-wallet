import {firestore} from "firebase-admin";
import {WalletDetails, WalletOperation} from "./types";
import {
  creditWalletSchema,
  debitWalletSchema,
  createWalletSchema,
} from "./validationSchema";


/**
 * Wallet Service class with methods for creating,
 *  crediting, and debiting wallets.
 */
export class WalletService {
  private db: firestore.Firestore = firestore();

  /**
 * Credits an amount to a specified wallet.
 * Validates the input parameters using a schema,
 * then updates the wallet balance in a Firestore transaction.
 *
 * @param {WalletOperation} params - Wallet operation
 * parameters including walletId and amount.
 * @return {Promise<void>} - A promise resolving with no value.
 * @throws {Error} - Throws an error if the wallet
 *  does not exist or validation fails.
 */
  async creditWallet(
    {walletId, amount}: WalletOperation): Promise<void> {
    await creditWalletSchema.validate({walletId, amount});

    await this.db.runTransaction(async (transaction) => {
      const walletRef = this.db.collection("wallets").doc(walletId);
      const walletDoc = await transaction.get(walletRef);

      if (!walletDoc.exists) {
        throw new Error("Wallet not found");
      }

      const newBalance = Number(walletDoc.data()?.balance) + Number(amount);
      transaction.update(walletRef, {balance: newBalance});
    });
  }

  /**
* Debits an amount from a specified wallet.
* Validates the input parameters using a schema,
* then updates the wallet balance in a Firestore transaction.
*
* @param {WalletOperation} params - Wallet operation parameters
* including walletId and amount.
* @return {Promise<void>} - A promise resolving with no value.
* @throws {Error} - Throws an error if the wallet does not exist,
*  funds are insufficient, or validation fails.
*/
  async debitWallet({walletId, amount}: WalletOperation): Promise<void> {
    await debitWalletSchema.validate({walletId, amount});

    await this.db.runTransaction(async (transaction) => {
      const walletRef = this.db.collection("wallets").doc(walletId);
      const walletDoc = await transaction.get(walletRef);

      if (!walletDoc.exists) {
        throw new Error("Wallet not found");
      }

      const currentBalance = Number(walletDoc.data()?.balance);
      if (currentBalance < amount) {
        throw new Error("Insufficient funds");
      }

      const newBalance = currentBalance - Number(amount);
      transaction.update(walletRef, {balance: newBalance});
    });
  }

  /**
 * Creates a new wallet for a user with an initial balance of 0.
* Validates the userId using a schema,
* then creates a new document in the wallets collection.
*
* @param {object} params - Parameters including the userId for the new wallet.
* @param {string} params.userId - The ID of the user
*  for whom to create the wallet.
* @return {Promise<WalletDetails>} - A promise resolving with no value.
* @throws {Error} - Throws an error if validation fails.
*/
  async createWallet(
    {userId}: { userId: string }): Promise<WalletDetails> {
    await createWalletSchema.validate({userId});

    // check if wallet already exists
    const walletDoc = await this.db.collection("wallets").doc(userId).get();
    if (walletDoc.exists) {
      throw new Error("Wallet already exists");
    }
    const newWallet: WalletDetails = {
      id: userId,
      balance: 0,
    };

    await this.db.collection("wallets").doc(userId).set({
      ...newWallet,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    return newWallet;
  }

  /**
   * Retrieves the details of a wallet by its ID.
   * @param {string} walletId - The ID of the wallet to retrieve.
   * @return {Promise<WalletDetails>} - A promise that
   *  resolves with the wallet details.
   * @throws {Error} - Throws an error if the wallet does not exist.
   * */
  async getWallet(walletId: string): Promise<WalletDetails> {
    const walletDoc = await this.db.collection("wallets").doc(walletId).get();

    if (!walletDoc.exists) {
      throw new Error("Wallet not found");
    }

    return walletDoc.data() as WalletDetails;
  }
}
