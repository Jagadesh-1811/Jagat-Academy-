import express from "express";
import { 
  issueCertificate,
  claimCertificate,
  getCertificateById,
  verifyCertificate,
  getUserCertificates,
  revokeCertificate,
  getBlockchainDetails,
  getLinkedInShareParams
} from "../controllers/certificationController.js";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";

const certificationRouter = express.Router();

certificationRouter.post("/issue", isAuth, isAdmin, issueCertificate);
certificationRouter.post("/claim", isAuth, claimCertificate);
certificationRouter.get("/user/:id", isAuth, getUserCertificates);
certificationRouter.get("/:id", getCertificateById);
certificationRouter.post("/verify", verifyCertificate);
certificationRouter.post("/revoke", isAuth, isAdmin, revokeCertificate);
certificationRouter.get("/blockchain/:txHash", getBlockchainDetails);
certificationRouter.post("/share/linkedin", isAuth, getLinkedInShareParams);

export default certificationRouter;
