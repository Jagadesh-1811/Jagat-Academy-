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
        width: 200,
        color: { dark: "#1B365D", light: "#FFFFFF" },
      });

      // PDF: Landscape A4 (841.89 x 595.28 pts)
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const ws = fs.createWriteStream(outputPath);
      doc.pipe(ws);

      const pageWidth = 841.89;
      const pageHeight = 595.28;

      // === BACKGROUND - Gray ===
      doc.fillColor("#e4e5e7")
         .rect(0, 0, pageWidth, pageHeight)
         .fill();

      // === GRADIENT BLOBS (approximated with circles) ===
      // Pink blob - top right
      doc.fillOpacity(0.6)
         .fillColor("#ff3b7c");
      doc.circle(pageWidth + 50, pageHeight * -0.15, pageWidth * 0.225).fill();
      
      // Yellow blob - middle right
      doc.fillOpacity(0.9)
         .fillColor("#ffe34d");
      doc.circle(pageWidth + 42, pageHeight * 0.2, pageWidth * 0.25).fill();
      
      // Purple blob - bottom right
      doc.fillOpacity(0.75)
         .fillColor("#8b7ff9");
      doc.circle(pageWidth + 60, pageHeight * 1.2, pageWidth * 0.275).fill();
      
      // Orange blob - bottom center-right
      doc.fillOpacity(0.6)
         .fillColor("#ff9a76");
      doc.circle(pageWidth * 0.625, pageHeight * 1.15, pageWidth * 0.225).fill();
      
      // Reset opacity
      doc.fillOpacity(1.0);

      // === CONTENT AREA (with padding) ===
      const padding = pageWidth * 0.08;
      const contentWidth = pageWidth - (padding * 2);
      
      // Logo & "JAGAT ACADEMY" - top left
      doc.fillColor("#1a1a1a")
         .font("Helvetica-Bold")
         .fontSize(10)
         .text("JAGAT ACADEMY", padding + 35, padding + 5, { width: contentWidth - 35 });

      // "Certificate Of Completion" - large title
      doc.fillColor("#2c2c2c")
         .font("Times-Roman")
         .fontSize(52)
         .text("Certificate", padding, padding + 70, { width: contentWidth, align: "left" });
      
      doc.fontSize(52)
         .text("Of Completion", padding, doc.y, { width: contentWidth, align: "left" });

      // "This certificate is awarded to" - small text
      const awardedToY = doc.y + 20;
      doc.fillColor("#333333")
         .font("Helvetica")
         .fontSize(9)
         .text("THIS CERTIFICATE IS AWARDED TO", padding, awardedToY, { width: contentWidth });

      // Student Name - very large
      const nameY = doc.y + 15;
      doc.fillColor("#1a1a1a")
         .font("Times-Bold")
         .fontSize(60)
         .text((data.studentName || "<<Name>>").toUpperCase(), padding, nameY, { 
           width: contentWidth,
           align: "left"
         });

      // Course description paragraph
      const descY = doc.y + 20;
      doc.fillColor("#333333")
         .font("Times-Roman")
         .fontSize(10)
         .text(
           `Awarded for the successful completion of the ${(data.courseTitle || "<<COURSE>>").toUpperCase()}. In recognition of outstanding performance and commitment to excellence.`,
           padding,
           descY,
           { width: contentWidth * 0.65, align: "left" }
         );

      // === SIGNATURE AREA (bottom) ===
      const sigAreaY = pageHeight - padding - 60;
      
      // Signature text - use script/handwriting font if available
      doc.fillColor("#2c2c2c");
      
      // Try to use custom font, fallback to Times-Roman
      const fontPath = path.join(process.cwd(), "public", "fonts", "jagadeeshwarcv.ttf");
      if (fs.existsSync(fontPath)) {
        try {
          doc.font(fontPath);
          doc.fontSize(28)
             .text("Jagadeeshwar", padding, sigAreaY - 25, { width: 140, align: "left" });
        } catch (fontErr) {
          console.warn("⚠️ Custom font failed, using fallback:", fontErr.message);
          doc.font("Times-Italic")
             .fontSize(14)
             .text("Jagadeeshwar", padding, sigAreaY - 25, { width: 140, align: "left" });
        }
      } else {
        // Fallback to Times-Italic (script-like)
        doc.font("Times-Italic")
           .fontSize(14)
           .text("Jagadeeshwar", padding, sigAreaY - 25, { width: 140, align: "left" });
      }
      
      // Signature line under name
      doc.strokeColor("#2c2c2c")
         .lineWidth(1)
         .moveTo(padding, sigAreaY)
         .lineTo(padding + 100, sigAreaY)
         .stroke();
      
      // "ACADEMY CEO" text below signature
      doc.fillColor("#1a1a1a")
         .font("Times-Roman")
         .fontSize(9)
         .text("ACADEMY CEO", padding, sigAreaY + 8, { width: 100, align: "center" });

      // Certificate ID & Date - bottom
      doc.fillColor("#666666")
         .font("Helvetica")
         .fontSize(8);
      
      const issueDate = data.issueDate 
        ? new Date(data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
      doc.text(`Certificate ID: ${data.certificateId} | Date: ${issueDate}`, padding, pageHeight - padding - 20, { 
        width: contentWidth,
        align: "left"
      });

      // === QR CODE - bottom right ===
      try {
        const qrBuf = Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ""), "base64");
        doc.image(qrBuf, pageWidth - padding - 80, pageHeight - padding - 90, { width: 70 });
        
        doc.fillColor("#666666")
           .font("Helvetica")
           .fontSize(7)
           .text("Scan to Verify", pageWidth - padding - 80, pageHeight - padding - 15, { 
             width: 70, 
             align: "center" 
           });
      } catch (qrError) {
        console.warn("⚠️ QR code generation failed:", qrError.message);
      }

      doc.end();

      ws.on("finish", () => {
        console.log(`✅ Certificate PDF generated successfully: ${outputPath}`);
        resolve(outputPath);
      });
      ws.on("error", (err) => {
        console.error("❌ Certificate PDF write stream error:", err);
        reject(err);
      });
    } catch (error) {
      console.error("❌ Certificate PDF generation error:", error);
      reject(error);
    }
  });
};
