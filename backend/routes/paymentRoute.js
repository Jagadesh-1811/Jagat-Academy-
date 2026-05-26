import express from "express"
import { createOrder, verifyPayment } from "../controllers/orderController.js";
import { 
  createSubscription, 
  calculateProration, 
  processInstallmentPayment, 
  getEMIOptions 
} from "../controllers/flexiblePaymentController.js";
import isAuth from "../middlewares/isAuth.js";


let paymentRouter = express.Router()

paymentRouter.post("/create-order", isAuth, createOrder);
paymentRouter.post("/verify-payment", isAuth, verifyPayment);
paymentRouter.post("/create-subscription", isAuth, createSubscription);
paymentRouter.post("/calculate-proration", isAuth, calculateProration);
paymentRouter.post("/process-installment", isAuth, processInstallmentPayment);
paymentRouter.get("/emi-options/:courseId", isAuth, getEMIOptions);


export default paymentRouter