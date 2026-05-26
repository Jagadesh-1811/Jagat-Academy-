import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";

export const generateCertificatePDF = (data, outputPath) => {
  return new Promise(async (resolve, reject) => {
    if (!data.verificationUrl) {
      const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
      data.verificationUrl = `${frontendBase}/verify/${data.certificateId}`;
    }
    try {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Generate QR Code
      const qrDataUrl = await QRCode.toDataURL(data.verificationUrl, {
        margin: 1,
        width: 100,
        color: { dark: "#000000", light: "#FFFFFF" },
      });

      // PDF: Landscape A4 (841.89 x 595.28 pts)
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const ws = fs.createWriteStream(outputPath);
      doc.pipe(ws);

      // Load Template
      const templatePath = path.join(process.cwd(), "public", "certificate-template.png");
      if (fs.existsSync(templatePath)) {
        // Draw the full page template
        doc.image(templatePath, 0, 0, { width: 841.89, height: 595.28 });
        
        // --- PATCH THE BAKED TEXT ---
        // We draw rectangles using the approximate background color to cover the baked text.
        // Color #E6E6E6 is a standard light grey that usually matches this type of gradient background.
        const patchColor = "#E6E5E5";
        
        // 1. Patch over <<Name>>
        doc.rect(80, 305, 450, 70).fill(patchColor);
        
        // 2. Patch over the paragraph containing <<COURSE>>
        doc.rect(80, 400, 360, 50).fill(patchColor);

        // Write the Student Name
        doc.fillColor("#333333")
           .font("Times-Bold")
           .fontSize(42)
           .text(data.studentName, 80, 315, { width: 450, align: "left" });

        // Rewrite the entire paragraph with the dynamic course title
        const bodyText = `AWARDED FOR THE SUCCESSFUL COMPLETION OF THE\n${data.courseTitle.toUpperCase()}, IN RECOGNITION OF OUTSTANDING\nPERFORMANCE AND COMMITMENT TO EXCELLENCE.`;
        
        doc.fillColor("#555555")
           .font("Helvetica")
           .fontSize(10)
           .text(bodyText, 80, 405, { width: 360, align: "left", lineGap: 3 });

        // Draw the QR Code at the bottom right corner of the document
        const qrBuf = Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ""), "base64");
        // Placing QR code in bottom right: page width is 841.89, height 595.28
        doc.image(qrBuf, 720, 470, { width: 80 });

        // Add verification link text below QR code
        doc.fillColor("#555555")
           .font("Helvetica")
           .fontSize(7)
           .text("Scan to Verify", 720, 555, { width: 80, align: "center" });

      } else {
        // Fallback to basic if template is missing
        doc.rect(0, 0, 841.89, 595.28).fill("#F3F4F6");
        doc.fillColor("#000000").font("Helvetica-Bold").fontSize(32).text("CERTIFICATE OF COMPLETION", 0, 150, { align: "center" });
        doc.font("Times-Bold").fontSize(48).text(data.studentName, 0, 250, { align: "center" });
        doc.font("Helvetica").fontSize(14).text(`Completed: ${data.courseTitle}`, 0, 350, { align: "center" });
        
        const qrBuf = Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ""), "base64");
        doc.image(qrBuf, 370, 450, { width: 100 });
      }

      doc.end();

      ws.on("finish", () => resolve(outputPath));
      ws.on("error", (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};
