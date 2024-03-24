import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import {WalletService} from "./services/wallet";
import * as admin from "firebase-admin";
import {AuthService} from "./services/auth";


admin.initializeApp({
  serviceAccountId: "simple-wallet-c84b1@appspot.gserviceaccount.com",
});

const authService = new AuthService();


const authenticate = authService.authenticate;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Include standard rate limit headers
  legacyHeaders: false, // Don't return the legacy headers
});


const app = express();

app.use(cors({origin: true}));
app.use(limiter);

const walletService = new WalletService();
// Route to generate a custom token
app.post("/generate-token", async (req, res) => {
  const {userId} = req.body;

  // Validate userId presence
  if (!userId) {
    res.status(400).send({message: "User ID is required."});
    return;
  }

  try {
    // Generate a custom token
    const customToken = await authService.generateCustomToken(userId);
    if (customToken) {
      res.send({token: customToken});
    } else {
      res.status(500).send({message: "Failed to generate custom token."});
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(
      {message: "An error occurred while generating the token."});
  }
});
// Define routes for the wallet API
app.post("/wallet", authenticate, async (req, res) => {
  try {
    const {userId} = req.body;
    const wallet = await walletService.createWallet({userId});
    res.status(201).send({message: "Wallet created successfully.", wallet});
  } catch (error) {
    res.status(400).send({error: (error as Error).message});
  }
});

app.get("/wallet/:id", authenticate, async (req, res) => {
  try {
    const {id: walletId} = req.params;
    const walletDetails = await walletService.getWallet(walletId);
    res.status(200).send(walletDetails);
  } catch (error) {
    res.status(404).send({error: (error as Error).message});
  }
});

app.put("/wallet/:id/credit", authenticate, async (req, res) => {
  try {
    const {id: walletId} = req.params;
    const {amount} = req.body;
    await walletService.creditWallet({walletId, amount});
    res.status(200).send({message: "Wallet credited successfully."});
  } catch (error) {
    res.status(400).send({error: (error as Error).message});
  }
});

app.put("/wallet/:id/debit", authenticate, async (req, res) => {
  try {
    const {id: walletId} = req.params;
    const {amount} = req.body; // Assuming the body contains an amount
    await walletService.debitWallet({walletId, amount});
    res.status(200).send({message: "Wallet debited successfully."});
  } catch (error) {
    res.status(400).send({error: (error as Error).message});
  }
});

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);

