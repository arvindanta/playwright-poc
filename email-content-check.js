const imaps = require("imap-simple");
const { simpleParser } = require("mailparser");

const config = {
  imap: {
    user: "arvindan.aswathanarayanan@freshworks.com",
    password: "use app password here",
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    authTimeout: 3000,
    tlsOptions: { rejectUnauthorized: false },
  },
};

function normalizeString(str) {
  return str.replace(/\s+/g, " ").trim(); // Replaces multiple spaces/newlines with a single space
}

(async () => {
  const connection = await imaps.connect({ imap: config.imap });
  await connection.openBox("INBOX");
  const subject = "Fwd: Sanity EUC Report - Monthly";
  const expectedText = `Hey there,

Here is your Monthly Sanity Report

Happy number crunching!`;

  const searchCriteria = ["UNSEEN", ["SUBJECT", subject]];
  const fetchOptions = {
    bodies: ["HEADER", "TEXT", ""],
    markSeen: false,
    struct: true,
  };

  const messages = await connection.search(searchCriteria, fetchOptions);

  console.log(messages.length);

  //   const body = messages[0].parts.filter((part) => part.which === "TEXT")[0]
  //     .body;

  //   console.log("body of email ", body);

  for (const res of messages) {
    const all = res.parts.find((part) => part.which === "");

    // Use mailparser to extract the body
    const parsed = await simpleParser(all.body);

    const emailBody = parsed.text; // Get plain text version of the email

    console.log(emailBody);

    // Normalize both the email body and the expected text
    const normalizedEmailBody = normalizeString(emailBody);
    const normalizedExpectedText = normalizeString(expectedText);

    console.log({ normalizedEmailBody, normalizedExpectedText });

    if (
      normalizedEmailBody &&
      normalizedEmailBody.includes(normalizedExpectedText)
    ) {
      console.log("Text found in email!");
      return true;
    } else {
      console.log("Text not found in email.");
    }
  }
})();
