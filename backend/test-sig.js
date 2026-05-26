import { generateCertificatePDF } from "./utils/pdfGenerator.js";
import path from "path";

const testData = {
  studentName: "Jagadeeshwar CV",
  courseTitle: "Advanced JavaScript Mastery",
  certificateId: "JAGAT-2024-99999",
  issueDate: new Date(),
  verificationUrl: "http://localhost:5173/verify/JAGAT-2024-99999"
};

const outputPath = path.join(process.cwd(), "public", "certificates", "test-sig-certificate.pdf");

console.log("🚀 Testing signature PDF generation...");

generateCertificatePDF(testData, outputPath)
  .then((result) => {
    console.log("✅ PDF with signature generated:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ FAILED:", error.message);
    process.exit(1);
  });
