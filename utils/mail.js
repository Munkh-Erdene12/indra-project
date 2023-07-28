const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP__HOST,
    port: process.env.SMTP__PORT,
    secure: false,
    auth: {
      user: process.env.SMTP__USERNAME,
      pass: process.env.SMTP__PASSWORD,
    },
  });

  let info = await transporter.sendMail({
    from: `${process.env.SMTP__FROM} <${process.env.SMPT_SEND_EMAIL}`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  });

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  return info;
};

module.exports = sendEmail;
