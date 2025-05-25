// import package modules
import nodemailer from "nodemailer";
import Mailgen from "mailgen";

// import local modules
import { envConfig } from "../env.js";
import { APIError } from "../../api/error.api.js";

// function to send different types of emails
export async function sendMail({ email, subject, mailGenContent }) {
  // create a template for email
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "CodeLab",
      link: envConfig.ORIGIN_URL,
    },
  });

  // generate html and plaintext content
  const mail = mailGenerator.generate(mailGenContent);
  const mailText = mailGenerator.generatePlaintext(mailGenContent);

  // object to store email options
  const mailOptions = {
    from: envConfig.MAIL_SERVICE_FROM,
    to: email,
    subject: subject,
    html: mail,
    text: mailText,
  };

  // create a transporter for sending emails
  const transporter = nodemailer.createTransport({
    host: envConfig.MAIL_SERVICE_HOST,
    port: Number(envConfig.MAIL_SERVICE_PORT),
    secure: envConfig.NODE_ENV === "production",
    auth: {
      user: envConfig.MAIL_SERVICE_USERNAME,
      pass: envConfig.MAIL_SERVICE_PASSWORD,
    },
  });

  // try to send email, if error occurs, throw an APIError
  await transporter.sendMail(mailOptions).catch(error => {
    throw new APIError(500, "Something went wrong while sending email", error);
  });
}
