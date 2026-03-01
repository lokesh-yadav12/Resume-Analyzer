const nodemailer = require('nodemailer');

// Email templates
const emailTemplates = {
  emailVerification: {
    subject: 'Verify Your Email - Career Boost AI',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Career Boost AI</h1>
            <p>Welcome to your AI-powered career journey!</p>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName}!</h2>
            <p>Thank you for joining Career Boost AI. To get started with analyzing your resume and discovering amazing job opportunities, please verify your email address.</p>
            <p>Click the button below to verify your email:</p>
            <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${data.verificationUrl}</p>
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 Career Boost AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  passwordReset: {
    subject: 'Reset Your Password - Career Boost AI',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>Career Boost AI</p>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName}!</h2>
            <p>We received a request to reset your password for your Career Boost AI account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${data.resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #ef4444;">${data.resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>This link will expire in 10 minutes for security reasons</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 Career Boost AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  welcomeEmail: {
    subject: 'Welcome to Career Boost AI! 🚀',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Career Boost AI</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #3b82f6; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Career Boost AI!</h1>
            <p>Your AI-powered career journey starts now</p>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName}!</h2>
            <p>Welcome to Career Boost AI! We're excited to help you accelerate your career with the power of artificial intelligence.</p>
            
            <h3>🚀 What you can do now:</h3>
            
            <div class="feature">
              <h4>📄 Upload Your Resume</h4>
              <p>Get instant ATS compatibility scores and detailed analysis of your resume's strengths and areas for improvement.</p>
            </div>
            
            <div class="feature">
              <h4>🎯 Discover Job Matches</h4>
              <p>Our AI will find personalized job recommendations based on your skills, experience, and career goals.</p>
            </div>
            
            <div class="feature">
              <h4>📚 Build Missing Skills</h4>
              <p>Identify skill gaps and get curated learning paths with courses from top platforms like Coursera, Udemy, and more.</p>
            </div>
            
            <div class="feature">
              <h4>📊 Track Your Progress</h4>
              <p>Monitor your career development with detailed analytics and insights about your professional growth.</p>
            </div>
            
            <a href="${data.dashboardUrl}" class="button">Get Started Now</a>
            
            <p>Need help? Our AI career advisor is available 24/7 to answer your questions and provide personalized guidance.</p>
          </div>
          <div class="footer">
            <p>© 2024 Career Boost AI. All rights reserved.</p>
            <p>Follow us on social media for career tips and updates!</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email service (e.g., SendGrid, AWS SES)
    return nodemailer.createTransporter({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // Development - use Ethereal Email for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'ethereal.pass'
      }
    });
  }
};

// Send email function
const sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    const transporter = createTransporter();
    
    let emailHtml = html;
    let emailSubject = subject;
    
    // Use template if provided
    if (template && emailTemplates[template]) {
      emailHtml = emailTemplates[template].html(data);
      emailSubject = emailTemplates[template].subject;
    }
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'Career Boost AI <noreply@careerboost.ai>',
      to,
      subject: emailSubject,
      html: emailHtml,
      text: text || stripHtml(emailHtml)
    };
    
    const result = await transporter.sendMail(mailOptions);
    
    // Log preview URL in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(result));
    }
    
    return result;
    
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

// Send bulk emails
const sendBulkEmail = async (emails) => {
  const results = [];
  
  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      results.push({ success: true, messageId: result.messageId, to: email.to });
    } catch (error) {
      results.push({ success: false, error: error.message, to: email.to });
    }
  }
  
  return results;
};

// Strip HTML tags for plain text version
const stripHtml = (html) => {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

// Email verification helper
const sendVerificationEmail = async (user, token) => {
  return sendEmail({
    to: user.email,
    template: 'emailVerification',
    data: {
      firstName: user.profile.firstName,
      verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${token}`
    }
  });
};

// Password reset helper
const sendPasswordResetEmail = async (user, token) => {
  return sendEmail({
    to: user.email,
    template: 'passwordReset',
    data: {
      firstName: user.profile.firstName,
      resetUrl: `${process.env.FRONTEND_URL}/reset-password/${token}`
    }
  });
};

// Welcome email helper
const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    template: 'welcomeEmail',
    data: {
      firstName: user.profile.firstName,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`
    }
  });
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  emailTemplates
};