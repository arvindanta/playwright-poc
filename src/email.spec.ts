import { test, expect } from '@playwright/test';
import imaps from 'imap-simple';
import fs from 'fs';
import pdf from 'pdf-parse';

test('Verify report email and PDF content', async ({ page }) => {
  const mailId = 'your-email@gmail.com';
  const password = 'your-password';
  const subject = 'Fwd: Sanity EUC Report - Monthly';
  const expectedEmailContent = 'Hey there, Here is your Monthly Sanity Report Happy number crunching!';
  const expectedPDFContent = 'Some expected text from the PDF';
  const downloadFolderPath = './downloads';

  // Step 1: Perform actions in Playwright to trigger report generation
//   await page.goto('https://your-app.com/reports');
//   await page.click('button#generate-report');

  // Step 2: Fetch the email containing the report
  const config = {
    imap: {
      user: "arvindan.aswathanarayanan@freshworks.com",
      password: "pwd-> need to use app passowrd",
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      authTimeout: 3000,
    },
  };

  const connection = await imaps.connect({ imap: config.imap });
  await connection.openBox('INBOX');

  const searchCriteria = ['UNSEEN', ['SUBJECT', subject]];
  const fetchOptions = { bodies: ['TEXT'], struct: true };

  const messages = await connection.search(searchCriteria, fetchOptions);

  expect(messages.length).toBeGreaterThan(0);

  const body = messages[0].parts.filter(part => part.which === 'TEXT')[0].body;

  console.log("body of email ", body)

  // Verify email content
  expect(body).toContain(expectedEmailContent);

  // Step 3: Download and verify PDF attachment
  const attachment = messages[0].parts.filter(part => part.disposition && part.disposition.type === 'attachment')[0];

  const filePath = `${downloadFolderPath}/${attachment.params.name}`;
  fs.writeFileSync(filePath, attachment.body);

  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdf(dataBuffer);

  // Verify PDF content
  expect(pdfData.text).toContain(expectedPDFContent);

  await connection.end();
});
