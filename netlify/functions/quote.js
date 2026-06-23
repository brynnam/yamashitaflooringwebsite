const sgMail = require("@sendgrid/mail");
const twilio = require("twilio");

const REQUIRED_ENV = [
  "SENDGRID_API_KEY",
  "QUOTE_TO_EMAIL",
  "QUOTE_FROM_EMAIL",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_FROM_NUMBER",
  "QUOTE_SMS_TO_NUMBER"
];

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
}

function clean(value) {
  return String(value || "").trim();
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    return json(500, {
      error: "Quote delivery is not configured.",
      missing
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { error: "Invalid request body." });
  }

  const name = clean(payload.name);
  const phone = clean(payload.phone);
  const floor = clean(payload.floor);
  const details = clean(payload.details);

  if (!name || !phone) {
    return json(400, { error: "Name and phone are required." });
  }

  const submittedAt = new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "medium",
    timeStyle: "short"
  });

  const lines = [
    "New quote request for Yamashita Flooring",
    "",
    `Submitted: ${submittedAt}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Floor type: ${floor || "Not selected"}`,
    "",
    "Project details:",
    details || "No project details provided."
  ];

  const fullMessage = lines.join("\n");

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  await sgMail.send({
    to: process.env.QUOTE_TO_EMAIL,
    from: process.env.QUOTE_FROM_EMAIL,
    replyTo: process.env.QUOTE_TO_EMAIL,
    subject: `New quote request from ${name}`,
    text: fullMessage
  });

  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await twilioClient.messages.create({
    to: process.env.QUOTE_SMS_TO_NUMBER,
    from: process.env.TWILIO_FROM_NUMBER,
    body: `New Yamashita Flooring quote request from ${name}. Check ${process.env.QUOTE_TO_EMAIL} for the full details. Customer phone: ${phone}`
  });

  return json(200, { ok: true });
};
