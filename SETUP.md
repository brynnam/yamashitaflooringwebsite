# Yamashita Flooring Quote Setup

This site uses a Netlify serverless function at `/.netlify/functions/quote`.

When a customer submits the quote form:

1. The full request is emailed to `yamashita08112@gmail.com`.
2. A Twilio SMS notification is sent to `+19097450028`.

## Required Hosting

Deploy this folder to Netlify so the serverless function can run:

```text
outputs/flooring-company-site
```

## Required Environment Variables

Set these in Netlify under Site settings > Environment variables.

```text
SENDGRID_API_KEY=your_sendgrid_api_key
QUOTE_TO_EMAIL=yamashita08112@gmail.com
QUOTE_FROM_EMAIL=your_verified_sendgrid_sender_email
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=your_twilio_phone_number
QUOTE_SMS_TO_NUMBER=+19097450028
```

`QUOTE_FROM_EMAIL` must be a verified sender in SendGrid. `TWILIO_FROM_NUMBER` must be a Twilio number on your account that can send SMS.

## Local Testing

After installing dependencies, run:

```text
npm install
npm run dev
```

Open the Netlify local URL, not the raw `file://` URL, because serverless functions do not run from a plain local file.
