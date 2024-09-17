const imaps = require("imap-simple");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { simpleParser } = require("mailparser");

const config = {
  imap: {
    user: "arvindan.aswathanarayanan@freshworks.com",
    password: "your app password",
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    authTimeout: 3000,
    tlsOptions: { rejectUnauthorized: false },
  },
};

// Function to fetch the email and attachment
async function downloadPdfAttachment(subject) {
  try {
    const connection = await imaps.connect(config);

    // Open inbox and search for the email
    await connection.openBox("INBOX");
    const searchCriteria = ["UNSEEN", ["SUBJECT", subject]];
    const fetchOptions = {
      bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "HEADER", "TEXT", ""],
      struct: true,
      markSeen: false,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    if (messages.length === 0) {
      console.log("No unread emails found with the subject:", subject);
      return;
    }

    console.log(messages);

    const res = messages[0];

    const all = res.parts.find((part) => part.which === "");

    // Use mailparser to extract the body
    const parsed = await simpleParser(all.body);

    const emailBody = parsed.text; // Get plain text version of the email

    // console.log({ emailBody });

    const parts = imaps.getParts(messages[0].attributes.struct);

    //console.log({ parts });
    const attachmentPart = parts.find((part) => {
      console.log({ disposition: part.disposition });
      return (
        part.disposition && part.disposition.type.toLowerCase() === "attachment"
      );
    });

    if (attachmentPart) {
      const attachment = await connection.getPartData(
        messages[0],
        attachmentPart
      );

      // Save the PDF attachment locally
      const filePath = `./${attachmentPart.params.name}`;
      fs.writeFileSync(filePath, attachment);

      console.log(`Attachment saved: ${filePath}`);
      return filePath;
    } else {
      console.log("No attachment found.");
    }

    connection.end();
  } catch (err) {
    console.error("Error fetching attachment:", err);
  }
}

async function analyzePdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);

  try {
    const data = await pdfParse(dataBuffer);

    console.log(`PDF File: ${filePath}`);
    console.log(`Number of Pages: ${data.numpages}`);
    console.log(`Text Content: ${data.text}`);
  } catch (err) {
    console.error("Error reading PDF:", err);
  }
}

(async () => {
  const filePath = await downloadPdfAttachment(
    "Fwd: Sanity EUC Report - Monthly"
  );

  if (filePath) {
    await analyzePdf(filePath);
  }
})();
