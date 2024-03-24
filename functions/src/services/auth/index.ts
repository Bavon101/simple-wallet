import * as admin from "firebase-admin";
import express from "express";
import * as functions from "firebase-functions";


/**
 * Service class responsible for authentication tasks,
 *  including generating custom tokens
 * and middleware for verifying Firebase Auth tokens in Express requests.
 */
export class AuthService {
  /**
   * Generates a custom token for a given user ID.
   *
   * This method uses the Firebase Admin SDK to create a custom token
   * , which can be used for authentication
   * on the client side. The custom token can then be
   *  exchanged for a Firebase ID token using
   * Firebase Authentication on the client.
   *
   * @param {string} userId The unique identifier for the user for
   *  whom the custom token is generated.
   * @return {Promise<string | undefined>} A promise that resolves with the
   * custom token, or undefined if an error occurs.
   */
  async generateCustomToken(userId: string): Promise<string | undefined> {
    try {
      const customToken = await admin.auth().createCustomToken(userId);
      return await this.exchangeCustomTokenForIdToken(customToken);
    } catch (error) {
      console.error("Error creating custom token:", error);
    }
    return undefined;
  }

  /**
 * Exchanges a custom token for a Firebase ID token.
 *
 * This method sends a POST request to the Firebase Auth REST API
 * to exchange a custom token for a Firebase ID token.
 * The ID token can then be used to authenticate requests to Firebase services.
 * @param {string} customToken The custom token to exchange for an ID token.
 * @return {Promise<string | undefined>}
 *  A promise that resolves with the ID token,
 * or undefined if an error occurs.
 */
  async exchangeCustomTokenForIdToken(
    customToken: string
  ): Promise<string | undefined> {
    const firebaseApiKey = functions.config().api.web_api_key;
    const signInWithCustomTokenUrl =
`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${firebaseApiKey}`;

    try {
      const response = await fetch(signInWithCustomTokenUrl, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          token: customToken,
          returnSecureToken: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Firebase signInWithCustomToken failed");
      }

      const data = await response.json();
      return data.idToken; // This is the ID token
    } catch (error) {
      console.error("Error exchanging custom token for ID token:", error);
      return undefined;
    }
  }

  /**
   * Express middleware for authenticating requests using Firebase Auth tokens.
   *
   * This method checks for a Firebase ID token in
   *  the Authorization header of the request. It verifies
   * the token using the Firebase Admin SDK. If verification
   * is successful, it attaches the UID of
   * the authenticated user to the response's locals object and
   *  calls the next middleware.
   * If the token is missing, invalid, or verification fails,
   * it sends an appropriate response.
   *
   * @param {express.Request} req The request object.
   * @param {express.Response} res The response object.
   * @param {express.NextFunction} next
   * The next middleware function in the stack.
   */
  async authenticate(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    const headerToken = req.headers?.authorization;
    if (!headerToken) {
      res.status(401).send({message: "No token provided"});
      return;
    }

    if (headerToken && headerToken.split(" ")[0] !== "Bearer") {
      res.status(401).send({message: "Invalid token"});
      return;
    }

    const token = headerToken.split(" ")[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      res.locals.uid = decodedToken.uid;
      return next();
    } catch (err) {
      console.error("Error verifying token:", err);
      res.status(403).send({message: "Could not authorize"});
    }
  }
}
