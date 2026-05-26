import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";

/**
 * Generate a professional certificate PDF
 * @param {Object} data - { studentName, courseTitle, certificateId, issueDate, level, verificationUrl }
 * @param {String} outputPath - File path to save the generated PDF
 * @returns {Promise<String>} - Path to the generated certificate PDF
 */
export const generateCertificatePDF = (data, outputPath) => {
  return new Promise(async (resolve, reject) => {
    // Allow caller to pass verificationUrl, or build a default from FRONTEND_URL
    if (!data.verificationUrl) {
      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
      data.verificationUrl = `${frontendBase}/verify/${data.certificateId}`;
    }
    try {
      // Ensure target directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Generate QR Code data URL
      const qrDataUrl = await QRCode.toDataURL(data.verificationUrl, {
        margin: 1,
        width: 100,
        color: {
          dark: "#1B365D",
          light: "#FFFFFF"
        }
      });

      // Create PDF Document in Landscape A4 (841.89 x 595.28 points)
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 40, bottom: 40, left: 40, right: 40 }
      });

      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // Colors
      const primaryColor = "#1B365D"; // Navy Blue
      const goldColor = "#C5A059";    // Muted Gold
      const textColor = "#2D3748";    // Dark Slate
      const lightGold = "#F6F1E5";    // Off-white gold tint

      // Draw background styling
      doc.rect(20, 20, 801.89, 555.28)
         .lineWidth(5)
         .stroke(primaryColor);

      doc.rect(28, 28, 785.89, 539.28)
         .lineWidth(2)
         .stroke(goldColor);

      // Add a subtle gold-tinted header/footer bar
      doc.rect(30, 30, 781.89, 60).fill(lightGold);

      // Header text
      doc.fillColor(primaryColor)
         .font("Helvetica-Bold")
         .fontSize(24)
         .text("JAGAT ACADEMY", 50, 48, { align: "left" });

      doc.fillColor(textColor)
         .font("Helvetica")
         .fontSize(10)
         .text("Empowering Minds, Shaping Futures", 50, 74, { align: "left" });

      // Certificate Title
      doc.fillColor(goldColor)
         .font("Times-Bold")
         .fontSize(38)
         .text("CERTIFICATE OF COMPLETION", 40, 140, { align: "center" });

      // Subtitle
      doc.fillColor(textColor)
         .font("Helvetica")
         .fontSize(14)
         .text("THIS CERTIFICATE IS PROUDLY PRESENTED TO", 40, 200, { align: "center" });

      // Student Name
      doc.fillColor(primaryColor)
         .font("Times-Bold")
         .fontSize(32)
         .text(data.studentName.toUpperCase(), 40, 235, { align: "center" });

      // Completion details
      doc.fillColor(textColor)
         .font("Helvetica")
         .fontSize(14)
         .text(`for successfully completing the course`, 40, 285, { align: "center" });

      doc.fillColor(primaryColor)
         .font("Helvetica-Bold")
         .fontSize(22)
         .text(data.courseTitle, 40, 310, { align: "center" });

      doc.fillColor(textColor)
         .font("Helvetica-Oblique")
         .fontSize(12)
         .text(`With a performance level of ${data.level || "Gold"}`, 40, 345, { align: "center" });

      // Vector Badge Seal
      // Let's draw an elegant seal in the bottom center
      const centerX = 841.89 / 2;
      const centerY = 450;
      doc.save();
      doc.translate(centerX, centerY);
      
      // Draw outer gold circle with dash pattern
      doc.circle(0, 0, 35)
         .lineWidth(2)
         .stroke(goldColor);
         
      doc.circle(0, 0, 30)
         .fill(primaryColor);
         
      // Gold star in the center
      doc.fillColor(goldColor)
         .font("Helvetica-Bold")
         .fontSize(18)
         .text("JA", -12, -7, { align: "center" });
      doc.restore();

      // Bottom left: QR Code & Verification Info
      const qrImageBuffer = Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ""), "base64");
      doc.image(qrImageBuffer, 70, 420, { width: 85 });
      
      doc.fillColor(textColor)
         .font("Helvetica")
         .fontSize(8)
         .text(`Certificate ID: ${data.certificateId}`, 70, 510)
         .text(`Date of Issue: ${new Date(data.issueDate).toLocaleDateString()}`, 70, 522);

      // Bottom right: Signature line and text
      const sigX = 580;
      const sigY = 460;
      
      // Draw a line above signature name
      doc.moveTo(sigX, sigY - 10)
         .lineTo(sigX + 180, sigY - 10)
         .lineWidth(1)
         .stroke(textColor);

      // Handwritten cursive signature simulation
      doc.fillColor("#0F172A")
         .font("Times-BoldItalic")
         .fontSize(20)
         .text("Jagadeeshwar C V", sigX + 15, sigY - 32, { width: 150, align: "center" });

      // Signature title
      doc.fillColor(textColor)
         .font("Helvetica-Bold")
         .fontSize(11)
         .text("Jagadeeshwar C V", sigX, sigY, { width: 180, align: "center" })
         .font("Helvetica")
         .fontSize(9)
         .fillColor("#64748B")
         .text("Founder, Jagat Academy", sigX, sigY + 12, { width: 180, align: "center" });

      // End PDF Generation
      doc.end();

      writeStream.on("finish", () => {
        resolve(outputPath);
      });

      writeStream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
