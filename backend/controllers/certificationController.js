import Certificate from "../models/certificateModel.js";
import User from "../models/userModel.js";
import Course from "../models/courseModel.js";
import Progress from "../models/progressModel.js";
import Attendance from "../models/attendanceModel.js";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { generateCertificatePDF } from "../utils/pdfGenerator.js";
import { sendCertificateEmail } from "../configs/Mail.js";

/**
 * Check if student meets certification criteria
 * Progress >= 80%
 */
const checkEligibility = async (studentId, courseId) => {
  const course = await Course.findById(courseId);
  if (!course) return { eligible: false, reason: "Course not found" };

  // 1. Check Course Progress
  const progressRecord = await Progress.findOne({ student: studentId, course: courseId });
  const progress = progressRecord ? progressRecord.progressPercentage : 0;
  
  if (progress < 80) {
    return { 
      eligible: false, 
      progress, 
      attendance: 0, 
      reason: `Course progress is ${progress}% (required: >= 80%)` 
    };
  }

  // 2. Check Attendance (Requirement removed)
  let attendancePercentage = 100;

  return {
    eligible: true,
    progress,
    attendance: attendancePercentage
  };
};

/**
 * Auto-issue certificate helper called internally from progressController
 */
export const autoIssueCertificateIfEligible = async (studentId, courseId, protocol, host) => {
  try {
    const eligibility = await checkEligibility(studentId, courseId);
    if (!eligibility.eligible) return { success: false, reason: eligibility.reason };

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({ studentId, courseId, status: "active" });
    if (existingCert) return { success: true, message: "Certificate already exists", certificate: existingCert };

    const student = await User.findById(studentId).populate("parents", "email name");
    const course = await Course.findById(courseId);

    const certificateId = "JAGT-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    const relativePdfPath = `/public/certificates/${certificateId}.pdf`;
    const absolutePdfPath = path.join(process.cwd(), "public", "certificates", `${certificateId}.pdf`);
    
    const verificationUrl = `${protocol}://${host}/verify/${certificateId}`;
    const pdfDownloadUrl = `${protocol}://${host}${relativePdfPath}`;

    let finalPdfPath = relativePdfPath;
    let finalDownloadUrl = pdfDownloadUrl;

    try {
      await generateCertificatePDF({
        studentName: student.name,
        courseTitle: course.title,
        certificateId,
        issueDate: new Date(),
        level: "Gold",
        verificationUrl
      }, absolutePdfPath);
    } catch (pdfError) {
      console.warn("PDF generation failed, falling back to default image:", pdfError);
      finalPdfPath = "https://placehold.co/800x600?text=Certificate+of+Completion";
      finalDownloadUrl = finalPdfPath;
    }

    const certificate = new Certificate({
      studentId,
      courseId,
      certificateId,
      ipfsHash: finalPdfPath,
      blockchainTxHash: "SIG-" + crypto.createHash("sha256").update(certificateId + student.name).digest("hex").substring(0, 32),
      level: "Gold",
      status: "active"
    });

    await certificate.save();

    try {
      await sendCertificateEmail(student.email, student.name, course.title, finalDownloadUrl);
      if (student.parents && student.parents.length > 0) {
        for (const parent of student.parents) {
          await sendCertificateEmail(parent.email, student.name, `${course.title} (Student: ${student.name})`, finalDownloadUrl);
        }
      }
    } catch (emailError) {
      console.warn("Failed to send certificate emails, continuing anyway:", emailError);
    }

    return { success: true, certificate };
  } catch (error) {
    console.error("Auto issue error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Issue a new certificate
 * POST /api/certification/issue
 */
export const issueCertificate = async (req, res) => {
  try {
    const { studentId, courseId, level, force } = req.body;

    const student = await User.findById(studentId).populate("parents", "email name");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({ studentId, courseId, status: "active" });
    if (existingCert) {
      return res.status(200).json({
        success: true,
        message: "Active certificate already exists for this course",
        certificate: existingCert
      });
    }

    // Unless 'force' is passed by admin/educator, check progress and attendance requirements
    if (!force) {
      const eligibility = await checkEligibility(studentId, courseId);
      if (!eligibility.eligible) {
        return res.status(400).json({
          success: false,
          message: `Eligibility requirements not met: ${eligibility.reason}`,
          progress: eligibility.progress,
          attendance: eligibility.attendance
        });
      }
    }

    // Generate unique Certificate ID
    const certificateId = "JAGT-" + crypto.randomBytes(4).toString("hex").toUpperCase();

    // Setup certificate paths
    const relativePdfPath = `/public/certificates/${certificateId}.pdf`;
    const absolutePdfPath = path.join(process.cwd(), "public", "certificates", `${certificateId}.pdf`);
    
    // Public host URL (adjust for production)
    const host = req.get("host");
    const protocol = req.protocol;
    const verificationUrl = `${protocol}://${host}/verify/${certificateId}`;
    const pdfDownloadUrl = `${protocol}://${host}${relativePdfPath}`;

    // Generate the PDF
    await generateCertificatePDF({
      studentName: student.name,
      courseTitle: course.title,
      certificateId,
      issueDate: new Date(),
      level: level || "Gold",
      verificationUrl
    }, absolutePdfPath);

    // Save record to DB
    // Satisfy required schema fields
    const certificate = new Certificate({
      studentId,
      courseId,
      certificateId,
      ipfsHash: relativePdfPath, // Store path in ipfsHash to satisfy schema
      blockchainTxHash: "SIG-" + crypto.createHash("sha256").update(certificateId + student.name).digest("hex").substring(0, 32),
      level: level || "Gold",
      status: "active"
    });

    await certificate.save();

    // Send emails (to student)
    await sendCertificateEmail(student.email, student.name, course.title, pdfDownloadUrl);

    // Send emails to parents if configured
    if (student.parents && student.parents.length > 0) {
      for (const parent of student.parents) {
        await sendCertificateEmail(
          parent.email,
          student.name,
          `${course.title} (Student: ${student.name})`,
          pdfDownloadUrl
        );
      }
    }

    res.status(201).json({
      success: true,
      message: "Certificate generated and emailed successfully",
      certificate,
      pdfUrl: pdfDownloadUrl
    });
  } catch (error) {
    console.error("Error issuing certificate:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get certificate by ID
 * GET /api/certification/:id
 */
export const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findOne({ certificateId: id })
      .populate("studentId", "name email")
      .populate("courseId", "title");

    if (!certificate) return res.status(404).json({ message: "Certificate not found" });

    res.status(200).json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Claim a certificate manually (Student action)
 * POST /api/certification/claim
 */
export const claimCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.userId; // From isAuth middleware

    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required" });
    }

    const protocol = req.protocol;
    const host = req.get("host");

    // Let the autoIssue helper handle eligibility check, creation, and emailing
    const result = await autoIssueCertificateIfEligible(studentId, courseId, protocol, host);

    if (!result.success) {
      // If the reason is eligibility related, return 400
      if (result.reason) {
        return res.status(400).json({ success: false, message: result.reason });
      }
      return res.status(500).json({ success: false, message: result.error || "Failed to generate certificate" });
    }

    res.status(200).json({
      success: true,
      message: result.message || "Certificate claimed successfully",
      certificate: result.certificate
    });

  } catch (error) {
    console.error("Claim certificate error:", error);
    res.status(500).json({ success: false, message: "Internal server error during certificate claim." });
  }
};

/**
 * Verify certificate authenticity
 * POST /api/certification/verify
 */
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.body;
    const certificate = await Certificate.findOne({ certificateId })
      .populate("studentId", "name email")
      .populate("courseId", "title");

    if (!certificate) {
      return res.status(200).json({
        verified: false,
        message: "Verification failed. Certificate ID not found."
      });
    }

    if (certificate.status === "revoked") {
      return res.status(200).json({
        verified: false,
        message: "Warning: This certificate has been revoked by the institution.",
        certificate
      });
    }

    res.status(200).json({
      verified: true,
      badge: "Verified by Jagat Academy Board",
      certificate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all certificates for a student
 * GET /api/certification/user/:id
 */
export const getUserCertificates = async (req, res) => {
  try {
    const { id } = req.params;
    const certificates = await Certificate.find({ studentId: id })
      .populate("courseId", "title")
      .lean();
      
    // Format response to include real PDF download links
    const protocol = req.protocol;
    const host = req.get("host");
    const formatted = certificates.map(c => ({
      ...c,
      pdfUrl: `${protocol}://${host}${c.ipfsHash}`
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Revoke certificate (Admin capability)
 * POST /api/certification/revoke
 */
export const revokeCertificate = async (req, res) => {
  try {
    const { certificateId, reason } = req.body;
    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) return res.status(404).json({ message: "Certificate not found" });

    certificate.status = "revoked";
    await certificate.save();

    res.status(200).json({
      success: true,
      message: `Certificate ${certificateId} revoked successfully. Reason: ${reason || "Not specified"}`,
      certificate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get digital validation details
 * GET /api/certification/blockchain/:txHash
 */
export const getBlockchainDetails = async (req, res) => {
  try {
    const { txHash } = req.params;
    const certificate = await Certificate.findOne({ blockchainTxHash: txHash });

    if (!certificate) return res.status(404).json({ message: "Digital signature not found on this system" });

    res.status(200).json({
      network: "Jagat Academy Central Signature Registry",
      smartContractAddress: "N/A (Standard Verified Signature)",
      transactionHash: txHash,
      status: "Success",
      blockNumber: 1,
      gasUsed: "0 Gwei",
      certificateId: certificate.certificateId,
      authority: "Jagadeeshwar C V, Founder"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Generate LinkedIn certified add-to-profile parameters
 * POST /api/certification/share/linkedin
 */
export const getLinkedInShareParams = async (req, res) => {
  try {
    const { certificateId } = req.body;
    const cert = await Certificate.findOne({ certificateId }).populate("courseId", "title");

    if (!cert) return res.status(404).json({ message: "Certificate not found" });

    const baseLinkedInUrl = "https://www.linkedin.com/profile/add";
    
    const protocol = req.protocol;
    const host = req.get("host");
    const certUrl = `${protocol}://${host}/verify/${cert.certificateId}`;

    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: cert.courseId.title,
      organizationName: "Jagat Academy",
      organizationId: "103849182", // Simulated org ID
      issueYear: new Date(cert.issueDate).getFullYear().toString(),
      issueMonth: (new Date(cert.issueDate).getMonth() + 1).toString(),
      certId: cert.certificateId,
      certUrl: certUrl
    });

    res.status(200).json({
      shareUrl: `${baseLinkedInUrl}?${params.toString()}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
