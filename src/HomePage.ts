import { Page, Locator } from "playwright";

export class HomePage {
  private page: Page;
  private reportDropdown: Locator;
  private allReports: Locator;
  private curatedReportsHeader: Locator;
  private schedulesHeader: Locator;
  private curatedReports: Locator;
  private myReports: Locator;
  private sharedReports: Locator;
  private newReport: Locator;
  private reportTitleBox: Locator;
  private confirmDeleteReport: Locator;
  private firstRecentlyViewed: Locator;
  private reportsSearch: Locator;
  private toasterSelector: Locator;
  private toasterCloseIconSelector: Locator;
  private cannotAddReportWarning: Locator;
  private shadowRoot1: Locator;
  private shadowRoot2: Locator;
  private toasterCloseIcon: Locator;
  

  constructor(page: Page) {
    this.page = page;
    this.reportDropdown = page.locator("//h1[contains(@id,'reportGroupView')]");
    this.allReports = page.locator("//span[text()='All reports']").first();
    this.curatedReportsHeader = page.locator(
      "//h1/*[contains(text(),'Curated reports')]"
    );
    this.schedulesHeader = page.locator("//h1/*[contains(text(),'Schedules')]");
    this.curatedReports = page.locator("//div/span[text()='Curated reports']");
    this.myReports = page.locator("//div/span[text()='Owned Reports']");
    this.sharedReports = page.locator("//div/span[text()='Shared reports']");
    this.newReport = page.locator("#newReportBtn");
    this.reportTitleBox = page.locator("#reportgroup-clone");
    this.confirmDeleteReport = page.locator(
      "//button/span[contains(text(),'Delete')]"
    );
    this.firstRecentlyViewed = page.locator("//*[@id='report-wrapper']");
    this.reportsSearch = page.locator("input.input[placeholder='Search']");
    this.toasterSelector = page.locator("//fw-toast-message[contains(@type,'success')]"); // Adjust the selector as needed
    this.toasterCloseIconSelector = page.locator("div.icon"); // Adjust the selector as needed
  
    this.shadowRoot1 = page.locator('fw-toast-message');
    this.shadowRoot2 = this.shadowRoot1.locator('fw-icon.remove');
    this.toasterCloseIcon = this.shadowRoot2.locator('div.icon');
    this.cannotAddReportWarning = this.shadowRoot1.locator('div.content');
  }

  async verifyLinks(): Promise<boolean> {
    try {
      console.log(this.allReports);
      await this.allReports.click();
    } catch (e) {}
    const curatedReportsVisible = await this.curatedReportsHeader.isVisible();
    console.log("curatedReportsVisible", curatedReportsVisible);
    const sharedReportsVisible = await this.sharedReports.isVisible();
    console.log("sharedReportsVisible", sharedReportsVisible);
    return curatedReportsVisible && sharedReportsVisible;
  }

  async closeWelcomePopup(): Promise<void> {
    const welcomePopup = this.page.locator('div[text()="Let\'s Get Started"]');
    if (await welcomePopup.isVisible()) {
      await welcomePopup.click();
    }
  }

  async createReport(): Promise<string> {
    const time = Date.now().toString();
    const reportName = "Automation_" + time;
    await this.newReport.click();
    await this.reportTitleBox.fill(reportName);
    return reportName;
  }

  async searchReport(reportName: string): Promise<boolean> {
    await this.reportsSearch.fill(reportName);
    await this.page.keyboard.press("Enter");
    const reportTitle = await this.page
      .locator("//div[@class='list-view report-title']")
      .textContent();
    if (reportTitle === reportName) {
      return true;
    } else {
      return await this.searchOtherPages(reportName);
    }
  }

  private async searchOtherPages(reportName: string): Promise<boolean> {
    let found = false;
    while (
      await this.page.locator("//span[contains(text(),'Next')]").isVisible()
    ) {
      await this.page.locator("//span[contains(text(),'Next')]").click();
      const reportTitle = await this.page
        .locator("//div[@class='list-view report-title']")
        .textContent();
      if (reportTitle === reportName) {
        found = true;
        break;
      }
    }
    return found;
  }

  async switchListAndGridView(): Promise<boolean> {
    await this.page.locator("//*[text()='Show as list']").click();
    await this.page.locator("//*[text()='Show as grid']").click();
    const listViewVisible = await this.page
      .locator("//*[text()='Report Name']")
      .isVisible();
    await this.page.locator("//*[text()='Show as list']").click();
    return listViewVisible;
  }

  async waitForSuccessMessage(): Promise<void> {
    try {
      // Wait for the toaster element to be visible (timeout set to 10 seconds)
      await this.toasterSelector.waitFor({ state: "visible", timeout: 10000 });

      // Wait for the toaster element to disappear (timeout set to 10 seconds)
      await this.toasterSelector.waitFor({ state: "hidden", timeout: 10000 });

      // If the toaster is still present, click the close icon
      if (await this.toasterSelector.isVisible()) {
        await this.toasterCloseIconSelector.click();
      }
    } catch (error) {
      console.error(
        `Error occurred while waiting for success message: ${error}`
      );
    }
  }
}
