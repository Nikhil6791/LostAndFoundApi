import sendViaBrevo from "../config/mailer.js";

const APP_NAME = "Lost & Found";

const sendMail = async ({ to, subject, html }) => {
  if (!to) return;

  try {
    await sendViaBrevo({ to, subject, html });
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
  }
};

export const sendLostReportConfirmationEmail = async (lostItem) => {
  await sendMail({
    to: lostItem.email,
    subject: `We've received your lost item report - ${lostItem.title}`,
    html: `
      <p>Hi ${lostItem.reporterName},</p>
      <p>Your lost item report has been received by ${APP_NAME}. Here are the details:</p>
      <ul>
        <li><strong>Title:</strong> ${lostItem.title}</li>
        <li><strong>Category:</strong> ${lostItem.category}</li>
        <li><strong>Location Lost:</strong> ${lostItem.locationLost}</li>
        <li><strong>Date Lost:</strong> ${new Date(lostItem.dateLost).toDateString()}</li>
      </ul>
      <p>We'll notify you by email if a matching item is found.</p>
      <p>Thank you,<br/>${APP_NAME} Team</p>
    `,
  });
};

export const sendFoundReportConfirmationEmail = async (foundItem) => {
  await sendMail({
    to: foundItem.email,
    subject: `We've received your found item report - ${foundItem.title}`,
    html: `
      <p>Hi ${foundItem.reporterName},</p>
      <p>Thank you for reporting a found item to ${APP_NAME}. Here are the details:</p>
      <ul>
        <li><strong>Title:</strong> ${foundItem.title}</li>
        <li><strong>Category:</strong> ${foundItem.category}</li>
        <li><strong>Location Found:</strong> ${foundItem.locationFound}</li>
        <li><strong>Date Found:</strong> ${new Date(foundItem.dateFound).toDateString()}</li>
      </ul>
      <p>Your report is under review by our team and will be published once approved.</p>
      <p>Thank you,<br/>${APP_NAME} Team</p>
    `,
  });
};

export const sendFoundMatchEmail = async (lostItem, foundItem) => {
  await sendMail({
    to: lostItem.email,
    subject: `Good news! An item matching "${lostItem.title}" may have been found`,
    html: `
      <p>Hi ${lostItem.reporterName},</p>
      <p>An item matching your lost report has been found and verified by our team:</p>
      <ul>
        <li><strong>Title:</strong> ${foundItem.title}</li>
        <li><strong>Category:</strong> ${foundItem.category}</li>
        <li><strong>Location Found:</strong> ${foundItem.locationFound}</li>
        <li><strong>Date Found:</strong> ${new Date(foundItem.dateFound).toDateString()}</li>
      </ul>
      <p>Please visit ${APP_NAME} and check the found items listing to claim your item.</p>
      <p>Thank you,<br/>${APP_NAME} Team</p>
    `,
  });
};
