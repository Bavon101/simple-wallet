# Wallet Function API

## Project Overview

This project implements a simple wallet system that allows for creating wallets, crediting, and debiting amounts from them. It utilizes Firebase Functions for the backend logic, Firebase Firestore for data persistence, and Firebase Authentication for securing API endpoints.

## Tech Stack

- **Backend**: Node.js with Firebase Functions
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication with custom tokens
- **Other Libraries**: Express for API routing, `jsonwebtoken` for token management, `node-fetch` for HTTP requests.

## Getting Started

### Prerequisites

- Node.js installed on your machine
- Firebase CLI installed globally (`npm install -g firebase-tools`)
- A Firebase project created in the [Firebase Console](https://console.firebase.google.com/)

### Setting Up the Project

1. **Clone the Repository**

    Clone this repository to your local machine.

2. **Login to Firebase**

    Use the Firebase CLI to log in to your Google account:

    ```bash
    firebase login
    ```

3. **Set Up Firebase Project**

    Initialize Firebase in your project directory. Select your Firebase project and configure it to use Firestore and Functions:

    ```bash
    firebase init
    ```

4. **Install Dependencies**

    Navigate to the `functions` directory and install the necessary npm packages:

    ```bash
    cd functions
    yarn install
    ```

5. **Set Environment Variables**

    Configure the necessary environment variables for your Firebase Functions:

    ```bash
    firebase functions:config:set api.web_api_key="your_firebase_api_key"
    ```

### Running Locally

To test your functions locally, you can use the Firebase Emulator Suite:

```bash
firebase emulators:start
```

### Deploying to Firebase

Deploy your functions to Firebase with the following command:

```bash
firebase deploy --only functions
```

## API Endpoints

### Authentication

- **Generate Custom Token**: `GET /generate-token`
  
  Generates a custom token for authentication. Requires an authenticated request.

### Wallet Operations

- **Create Wallet**: `POST /wallet`
  
  Creates a new wallet. Requires a valid ID token for authentication.

- **Credit Wallet**: `PUT /wallet/:id/credit`
  
  Credits an amount to a specified wallet. Requires a valid ID token for authentication.

- **Debit Wallet**: `PUT /wallet/:id/debit`
  
  Debits an amount from a specified wallet. Requires a valid ID token for authentication.

## Obtaining a Token for Testing

1. **Generate a Custom Token**: Use the `/generate-token` endpoint to generate a custom token. This endpoint simulates the server-side generation of a custom token that can be exchanged for an ID token on the client side.

2. **Exchange Custom Token for ID Token**: Use the custom token obtained from the previous step to make a request to Firebase's `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken` endpoint along with your Firebase API Key to obtain an ID token.

3. **Use the ID Token**: Include the ID token in the `Authorization` header as a Bearer token for authenticated requests to your API.

## Security Notes

- Ensure all API requests are made over HTTPS.
- Store sensitive keys and tokens securely and do not expose them in your source code.

## Contributing

Please feel free to contribute to this project by submitting pull requests or opening issues for bugs and feature requests.

---
# simple-wallet
