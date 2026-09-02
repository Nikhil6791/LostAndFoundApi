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

// Builds the "save this ID" block shared by both confirmation emails — the
// tracking ID lives permanently in the reporter's inbox this way, so it's not
// lost if they close the tab or refresh before noting it down.
const buildTrackingBlock = (trackingId) => {
  const userFrontendUrl = process.env.USER_FRONTEND_URL || "";
  const trackUrl = userFrontendUrl ? `${userFrontendUrl}/track?id=${encodeURIComponent(trackingId)}` : null;

  return `
    <p>Your tracking ID is <strong>${trackingId}</strong>. Save this — you can use it any time to check your report's status.</p>
    ${trackUrl ? `<p><a href="${trackUrl}">${trackUrl}</a></p>` : ""}
  `;
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
      ${buildTrackingBlock(lostItem.trackingId)}
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
      ${buildTrackingBlock(foundItem.trackingId)}
      <p>Your report is under review by our team and will be published once approved.</p>
      <p>Thank you,<br/>${APP_NAME} Team</p>
    `,
  });
};

// Sent to the lost-item reporter when the matching engine finds a found item that
// scores 70+ against their report. Deliberately leaves out the found reporter's
// name/phone/email — the recipient hasn't proven ownership yet, so we only point
// them to the public listing rather than handing out another person's contact info.
export const sendPotentialMatchEmail = async (lostItem, foundItem, score) => {
  const userFrontendUrl = process.env.USER_FRONTEND_URL || "";
  const viewItemUrl = userFrontendUrl ? `${userFrontendUrl}/found/${foundItem.id}` : null;
  const label = score >= 85 ? "Strong match" : "Potential match";

  await sendMail({
    to: lostItem.email,
    subject: `${label} found for your lost report - ${lostItem.title}`,
    html: `
      <p>Hi ${lostItem.reporterName},</p>
      <p>Our matching system found a found-item report that looks similar to the item you reported lost:</p>
      <ul>
        <li><strong>Your report:</strong> ${lostItem.title}</li>
        <li><strong>Matching found item:</strong> ${foundItem.title}</li>
        <li><strong>Match score:</strong> ${score}% (${label})</li>
        <li><strong>Category:</strong> ${foundItem.category}</li>
        <li><strong>Location Found:</strong> ${foundItem.locationFound}</li>
        <li><strong>Date Found:</strong> ${new Date(foundItem.dateFound).toDateString()}</li>
      </ul>
      ${viewItemUrl ? `<p><a href="${viewItemUrl}">View this found item on ${APP_NAME}</a></p>` : ""}
      <p>If this looks like your item, please get in touch with our team using the contact details on the item's page to verify and arrange the return.</p>
      <p>Thank you,<br/>${APP_NAME} Team</p>
    `,
  });
};
