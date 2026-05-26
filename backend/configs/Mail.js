import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create Nodemailer transporter
// Fallback to console logging if credentials are missing
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'gmail',
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE !== 'false', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER || '',
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || ''
  }
});

const sendMail = async (to, otp) => {
  try {
    const hasCredentials = (process.env.SMTP_USER || process.env.EMAIL_USER) && (process.env.SMTP_PASS || process.env.EMAIL_PASS);

    if (!hasCredentials) {
      console.log('\n==================================================');
      console.log(`📧  [SMTP CREDENTIALS MISSING] - FALLBACK LOG`);
      console.log(`👉  Recipient: ${to}`);
      console.log(`🔑  Verification Code: ${otp}`);
      console.log('==================================================\n');
      return true;
    }

    const mailOptions = {
      from: `"Jagat Academy" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to,
      subject: 'Jagat Academy - Educator Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 4px solid #000; color: #000; background-color: #fff;">
          <h2 style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">Educator Portal Verification</h2>
          <p style="font-size: 16px; line-height: 1.6;">Hello,</p>
          <p style="font-size: 16px; line-height: 1.6;">Thank you for registering as an educator with Jagat Academy. To verify your professional email address, please use the following 6-digit verification code:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-family: monospace; font-size: 36px; font-weight: bold; background-color: #f5f5f5; border: 2px solid #000; padding: 10px 20px; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666; line-height: 1.6;">This code is valid for 15 minutes. Please do not share this code with anyone.</p>
          <p style="font-size: 14px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px; text-align: center;">JAGAT ACADEMY INTEGRATED E-LEARNING PLATFORM</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email successfully sent to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${to}:`, error);
    // Even if it fails, log it to the console so developer can test
    console.log('\n==================================================');
    console.log(`📧  [EMAIL SEND FAILED] - FALLBACK LOG`);
    console.log(`👉  Recipient: ${to}`);
    console.log(`🔑  Verification Code: ${otp}`);
    console.log('==================================================\n');
    return true;
  }
};

const sendVerificationEmail = async (to, verificationToken, frontendUrl = 'http://localhost:5173', role = 'user') => {
  try {
    const clientUrl = frontendUrl || 'http://localhost:5173';
    const verificationLink = `${clientUrl.replace(/\/$/, '')}/verify-email/${verificationToken}`;

    const hasCredentials = (process.env.SMTP_USER || process.env.EMAIL_USER) && (process.env.SMTP_PASS || process.env.EMAIL_PASS);

    if (!hasCredentials) {
      console.log('\n==================================================');
      console.log(`📧  [SMTP CREDENTIALS MISSING] - FALLBACK LOG`);
      console.log(`👉  Recipient: ${to}`);
      console.log(`🔗  Verification Link: ${verificationLink}`);
      console.log('==================================================\n');
      return true;
    }

    const subject = role === 'educator'
      ? 'Jagat Academy - Educator Email Verification'
      : 'Jagat Academy - Verify Your Email';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 4px solid #000; color: #000; background-color: #fff;">
        <h2 style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">${subject}</h2>
        <p style="font-size: 16px; line-height: 1.6;">Hello,</p>
        <p style="font-size: 16px; line-height: 1.6;">Please verify your email address by clicking the button below. This link will expire in 24 hours.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;">Verify Email</a>
        </div>
        <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste the following URL into your browser:</p>
        <p style="font-size: 12px; color: #666; word-break: break-all;">${verificationLink}</p>
        <p style="font-size: 14px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px; text-align: center;">JAGAT ACADEMY INTEGRATED E-LEARNING PLATFORM</p>
      </div>
    `;

    const mailOptions = {
      from: `"Jagat Academy" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email successfully sent to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${to}:`, error);
    console.log('\n==================================================');
    console.log(`📧  [EMAIL SEND FAILED] - FALLBACK LOG`);
    console.log(`👉  Recipient: ${to}`);
    console.log(`🔗  Verification Link: ${frontendUrl}/verify-email/${verificationToken}`);
    console.log('==================================================\n');
    return true;
  }
};

const sendCertificateEmail = async (to, studentName, courseTitle, certificateUrl) => {
  try {
    const hasCredentials = (process.env.SMTP_USER || process.env.EMAIL_USER) && (process.env.SMTP_PASS || process.env.EMAIL_PASS);

    if (!hasCredentials) {
      console.log('\n==================================================');
      console.log(`📧  [SMTP CREDENTIALS MISSING] - FALLBACK LOG`);
      console.log(`👉  Recipient: ${to}`);
      console.log(`🎓  Student: ${studentName}`);
      console.log(`📚  Course Completed: ${courseTitle}`);
      console.log(`📄  Certificate Link: ${certificateUrl}`);
      console.log('==================================================\n');
      return true;
    }

    const mailOptions = {
      from: `"Jagat Academy" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to,
      subject: `Congratulations! Your Certificate for "${courseTitle}" is Ready`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 4px solid #1B365D; color: #333; background-color: #fff;">
          <div style="text-align: center; background-color: #F6F1E5; padding: 20px; border-bottom: 2px solid #C5A059;">
            <h1 style="color: #1B365D; margin: 0; font-size: 24px; text-transform: uppercase;">Jagat Academy</h1>
            <p style="margin: 5px 0 0; color: #C5A059; font-size: 14px;">Verification & Graduation Portal</p>
          </div>
          <div style="padding: 20px;">
            <h2 style="color: #1B365D;">Congratulations, ${studentName}!</h2>
            <p style="font-size: 16px; line-height: 1.6;">We are thrilled to inform you that you have completed the course <strong>"${courseTitle}"</strong> with flying colors, meeting all our rigorous academic and attendance requirements.</p>
            <p style="font-size: 16px; line-height: 1.6;">Your certificate has been processed, verified, and issued by our board.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${certificateUrl}" style="display: inline-block; padding: 14px 28px; background-color: #1B365D; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; border: 2px solid #C5A059;">View & Download Certificate</a>
            </div>
            
            <p style="font-size: 14px; color: #555;">You can also verify your certificate's authenticity anytime on our public portal using your unique Certificate ID.</p>
          </div>
          <div style="font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 15px; text-align: center; background-color: #fcfcfc; padding-bottom: 10px;">
            <p>JAGAT ACADEMY INTEGRATED E-LEARNING PLATFORM</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Certificate email successfully sent to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send certificate email to ${to}:`, error);
    return false;
  }
};

export { sendVerificationEmail, sendCertificateEmail };
export default sendMail;