import * as Yup from "yup";


export const creditWalletSchema = Yup.object({
  walletId: Yup.string().required("Wallet ID is required"),
  amount: Yup.number()
    .positive("Amount must be positive").required("Amount is required"),
});


export const debitWalletSchema = Yup.object({
  walletId: Yup.string().required("Wallet ID is required"),
  amount: Yup.number()
    .positive("Amount must be positive").required("Amount is required"),
});


export const createWalletSchema = Yup.object({
  userId: Yup.string().required("User ID is required"),
});
