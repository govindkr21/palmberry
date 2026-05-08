const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `PalmBerry <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email error:', error);
  }
};

const sendWhatsApp = async (phone, orderDetails) => {
  // Mock WhatsApp API implementation
  // In production, you'd use Twilio or a similar provider
  console.log(`[WHATSAPP MOCK] Sending confirmation to ${phone}`);
  console.log(`Order Details: ${orderDetails}`);
  
  // Example Twilio logic (commented out):
  /*
  const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    from: 'whatsapp:+14155238886',
    body: `Hi! Your PalmBerry order ${orderDetails} is confirmed. We will reach you shortly.`,
    to: `whatsapp:${phone}`
  });
  */
};

module.exports = { sendEmail, sendWhatsApp };
