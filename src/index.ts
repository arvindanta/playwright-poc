import { chromium, Page } from 'playwright';
import { HomePage } from './HomePage';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page: Page = await browser.newPage();
//  await page.goto('https://staging.freshreports.com/?appName=freshservice&auth=eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFMyNTYifQ.eyJmaXJzdE5hbWUiOiJGcmVzaHJlcG9ydHMiLCJsYXN0TmFtZSI6IkF1dG9tYXRpb24iLCJlbWFpbCI6InJhdmkucHJhc2FudGhAZnJlc2h3b3Jrcy5jb20iLCJ1c2VySWQiOjEzNjA3LCJzZXNzaW9uRXhwaXJhdGlvbiI6MTc1NDY0MDU2MCwidGVuYW50SWQiOjEwMDAwMDY2MCwidGltZXpvbmUiOiJBc2lhL0tvbGthdGEiLCJwb3J0YWxVcmwiOiJodHRwOi8vZmViMDEuZnJlc2hjbWRiLmNvbSJ9.U4VHVoS6wfkKnsh6BxzlPL1jwT0GswVySJiWMq2L6wA');

  await page.goto('https://d1fsdw4r9a6rw9.cloudfront.net/analytics/3188/');
  const homePage = new HomePage(page);
  await homePage.verifyLinks();
//  const reportName = await homePage.verifyLinks();
//  console.log(`Created report: ${reportName}`);
  await homePage.switchListAndGridView();

  //const isFound = await homePage.searchReport(reportName);
  //console.log(`Report found: ${isFound}`);

  await browser.close();
})();
