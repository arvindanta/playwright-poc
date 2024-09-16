import { Locator, Page } from "@playwright/test";

// Define HomePage class
export class HomePage {
  readonly page: Page;
  private newReport: Locator;
  private reportTitleBox: Locator;
  private toasterSelector: Locator;
  private toasterCloseIconSelector: Locator;
  private shadowRoot1: Locator;
  private shadowRoot2: Locator;
  private toasterCloseIcon: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newReport = page.locator("#newReportBtn");
    this.reportTitleBox = page.locator("//*[@id='reportGroupTitle']//input");
    this.toasterSelector = page.locator(
      "//fw-toast-message[contains(@type,'success')]"
    ); // Adjust the selector as needed
    this.toasterCloseIconSelector = page.locator("div.icon"); // Adjust the selector as needed

    this.shadowRoot1 = page.locator("fw-toast-message");
    this.shadowRoot2 = this.shadowRoot1.locator("fw-icon.remove");
    this.toasterCloseIcon = this.shadowRoot2.locator("div.icon");
  }

  async createReport(): Promise<void> {
    const time = Date.now().toString();
    const reportName = "Automation_" + time;
    await this.newReport.click();
    await this.reportTitleBox.fill(reportName);
    //return reportName;
    //    await this.page.click('selector-for-create-report');
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

// Define ReportGroup class
export class ReportGroup {
  readonly page: Page;
  moduleLoaderSelector: Locator;
  addWidgetSelector: Locator;
  widgetSelector: Locator;
  reportSave: Locator;
  reportGroupLoader: Locator;
  widgetLoader: Locator;
  editView: Locator;
  widgetExpand: Locator;

  constructor(page: Page) {
    this.page = page;
    this.moduleLoaderSelector = page.locator("//span[text()='Loading...']");
    this.addWidgetSelector = page.locator("#reportWidgetPane");
    this.widgetSelector = page
      .locator("//div[@id='add-widget-list']//h3")
      .first();
    this.reportSave = page.locator("#reportSave");
    this.reportGroupLoader = page.locator(
      "//div[@class='reportgroups-wrapper']//span[text()='Loading...']"
    );
    this.widgetLoader = page.locator("//div[@class='boxes']");
    this.editView = page.locator("//button[@id='Mode']//span");
    this.widgetExpand = page.locator("//a[@id='reportWidgetExpand']");
  }

  async addWidget(
    moduleName: string = "",
    widgetName: string = ""
  ): Promise<void> {
    // const addWidgetSelector = '#reportWidgetPane'; // Replace with actual selector
    const addWidgetsSearchSelector = "#reportWidgetSearch"; // Replace with actual selector
    const gallerySelector = "#gallery"; // Replace with actual selector
    // const moduleLoaderSelector = 'moduleLoaderSelector'; // Replace with actual selector
    // const widgetSelector = 'selector-for-widget'; // Replace with actual selector
    const reactDnDScriptPath = "./reactDnD2.js"; // Replace with the actual path to your JS file

    // Wait for the 'Add Widget' button to be present
    // await this.page.waitForSelector(addWidgetSelector);

    await this.addWidgetSelector.waitFor();

    // Check if 'Add Widget Search' is present
    if (!(await this.page.isVisible(addWidgetsSearchSelector))) {
      // Click the 'Add Widget' button if 'Add Widget Search' is not present
      // await this.page.click(addWidgetSelector);
      await this.addWidgetSelector.click();
    }

    // Click on the gallery if it is present
    if (await this.page.isVisible(gallerySelector)) {
      await this.page.click(gallerySelector);
    }

    // Wait for the module loader to hide
    await this.moduleLoaderSelector.waitFor({ state: "hidden" });

    // If a module name is provided, select the module
    if (moduleName !== "") {
      await this.selectModule(moduleName); // Ensure that the selectModule method is implemented
    }

    // Wait for the widget element to be present
    // await this.page.waitForSelector(widgetSelector);
    await this.widgetSelector.waitFor();

    // Execute the custom JavaScript for widget drag-and-drop
    const js = await this.readFile(reactDnDScriptPath);

    // await this.page.evaluate((widgetName, js) => {
    //   eval(js); // This evaluates the JS script
    //   // Assuming `dragAndDropWidget` function is defined in the JS file
    //   (window as any).simulateHTML5DragAndDrop(widgetName); // You may need to adjust this if the JS function is different
    // }, widgetName, js);

    // Execute the script in the page context with the widgetName argument
    await this.page.evaluate(
      ({ script, widgetName }) => {
        // Execute the provided JavaScript (reactDnD.js content) with widget name
        eval(script); // Evaluate the script
        (window as any).simulateHTML5DragAndDrop(widgetName); // Assuming dragAndDropWidget is defined in reactDnD.js
      },
      {
        script: js, // First argument to pass to evaluate() is the script content
        widgetName,
      } // Second argument to pass is the widget name
    );
  }

  // Placeholder for selectModule function
  async selectModule(moduleName: string): Promise<void> {
    // Logic to select module based on moduleName
    // Example: await this.page.click(`text=${moduleName}`);
  }

  // Helper method to read the JavaScript file (reactDnD2.js)
  async readFile(filePath: string): Promise<string> {
    const fs = require("fs");
    const path = require("path");
    return fs.readFileSync(path.join(__dirname, filePath), "utf-8");
  }

  async saveReport() {
    // Wait for the report save button to be clickable (visible and enabled)
    await this.reportSave.waitFor({ state: "visible" });
    await this.reportSave.waitFor({ state: "attached" });
    console.log("Report save button is visible and enabled");

    // Click on the save report button
    await this.reportSave.click();

    console.log("Clicked on the report save button");
    // Wait for the report save button to disappear (hide) after the click
    await this.reportSave.waitFor({ state: "hidden" });

    console.log("Report saved successfully before waiting for report group load");
    // Wait for the report group to load after saving
    await this.waitForReportGroupLoad();

    console.log("Report saved successfully");
  }

  async waitForReportGroupLoad() {
    // Wait for the report group loader to be visible and then hide
    try {
      await this.reportGroupLoader.waitFor({
        state: "visible",
        timeout: 15000,
      });
      await this.reportGroupLoader.waitFor({ state: "hidden" });
    } catch (e) { console.log("Error in waitForReportGroupLoad", e); }
    // Wait for the widget loader to hide
    await this.widgetLoader.waitFor({ state: "hidden" });
  }

  async expandWidget(widgetName: string | null = null, space: boolean = false) {
    // Wait for the widget loader to hide
    await this.widgetLoader.waitFor({ state: "hidden" });

    if (widgetName) {
      // Hover over the widget by name
      await (await this.widgetByName(widgetName, space)).hover();

      // Click to expand the widget by name
      await (await this.widgetExpandByName(widgetName, space)).click();
    } else {
      // Hover over the default widget card
      await this.mouseOverWidgetCard();

      // Click the default widget expand button
      await this.widgetExpand.click();
    }
  }

  // #For Chart Widget type, widget_type_value is "report".For other widgets replace report with the type of the widget
  async mouseOverWidgetCard(
    is_empty_widget = false,
    widget_type_value = "report"
  ) {
    (await this.widgetCardFirst(is_empty_widget, widget_type_value)).hover();
  }

  async widgetCardFirst(is_empty_widget, widget_type_value = "report") {
    return is_empty_widget
      ? this.page.locator("//div[contains(@class,'reportDragHandle')]")
      : this.page.locator(
          `(//div[contains(@class,'${widget_type_value}Widget')]//div)[1]`
        );
  }

  async widgetByName(name, space) {
    const xpath = `//div[normalize-space(@title)='${name}']/../..`;
    return this.page.locator(xpath);
  }

  async widgetExpandByName(name, space) {
    const xpath = ` xpath = `; //div[normalize-space(@title)='${name}']/../../..//a[@id='reportWidgetExpand']`
    return this.page.locator(xpath);
  }

  async changeReportMode(mode = "Edit"): Promise<void> {
    // if text=Edit, that means report is in view mode, but mode selected here is Edit by default
    // so matching text means modes are not matching, hence button need to be clicked to switch mode
    if (await this.editView.isVisible()) {
      await this.editView.click();
    } else {
      return;
    }
  }
}

// Define Filter class
export class Filter {
  readonly page: Page;
  widgetLoader: Locator;
  filterPanelTitle: Locator;
  filter: Locator;
  removeFilter: Locator;
  applyBtn: Locator;
  removeFilterSelector: Locator;
  moduleLoader: Locator;
  removeGroupBySelector: Locator;
  configureOpen: Locator;
  nlpConfigure: Locator;
  configure: Locator;

  constructor(page: Page) {
    this.page = page;
    this.widgetLoader = page.locator("//div[@class='boxes']");
    this.filterPanelTitle = page
      .locator(
        "//div[contains(@class,'side-pane open')]//div/span[contains(text(),'FILTERS')]"
      )
      .first();
    this.applyBtn = page.locator("#widgetApply");
    this.filter = page.locator("//button[@id='FilterPane']");
    this.removeFilter = page.locator(
      "//div[@id='filterSection']/following-sibling::div//a[not(@class)]"
    );
    this.moduleLoader = page.locator("//span[text()='Loading...']");
    this.removeGroupBySelector = page.locator("#widgetGroupByRemove");
    this.removeFilterSelector = page.locator(
      "//div[@id='filterSection']/following-sibling::div//a[not(@class)]"
    );
    this.nlpConfigure = page.locator(
      "//button[contains(@id,'freddyConfigPane')]"
    );
    this.configureOpen = page.locator(
      "//div[contains(@class,'side-pane open')]//span[contains(text(),'CONFIGURATION')]"
    );
    this.configure = page.locator("#ConfigPane");
  }

  async openFilterPanel() {
    // Wait for the widget loader to hide
    await this.widgetLoader.waitFor({ state: "hidden" });

    // Check if the filter panel title is not present, then click to open
    const isFilterPanelVisible = await this.filterPanelTitle.isVisible();
    if (!isFilterPanelVisible) {
      await this.filter.click();
    }

    // Wait for the filter panel title to be visible
    await this.filterPanelTitle.waitFor();
  }

  async removeAllFilters() {
    let i = 1;
    // Check if the filter is present and remove up to 40 filters
    while ((await this.removeFilterSelector.isVisible()) && i < 40) {
      await this.removeFilterSelector.click();
      i++;
    }
  }

  async clickApply() {
    // Click on the apply button
    await this.applyBtn.click();

    // Wait for the module loader and widget loader to hide
    await this.moduleLoader.waitFor({ state: "hidden" });
    await this.widgetLoader.waitFor({ state: "hidden" });
  }

  async removeGroupBy(field: number = 1) {
    // Wait for the group-by element to be clickable
    await this.removeGroupBySelector.waitFor({ state: "visible" });

    // Get all group-by elements
    const groupByElements = await this.removeGroupBySelector.elementHandles();

    // Click on the specified group-by element (default is 1st)
    if (groupByElements.length >= field) {
      await groupByElements[field - 1].click();
    }
  }

  async removeAllGroupBy() {
    let groupByElements = await this.removeGroupBySelector.elementHandles();

    // Click on all group-by elements until the list is empty
    while (groupByElements.length > 0) {
      await groupByElements[0].click();
      groupByElements = await this.removeGroupBySelector.elementHandles();
    }
  }

  async openConfigurePanel(nlpConfigure: boolean = false) {
    // Wait for the widget loader to disappear
    await this.widgetLoader.waitFor({ state: "hidden" });

    if (nlpConfigure) {
      // If NLP configure is true, wait for the NLP configure element and click it if the configure panel is not already open
      await this.nlpConfigure.waitFor();
      if (!(await this.configureOpen.isVisible())) {
        await this.nlpConfigure.click();
      }
    } else {
      // If NLP configure is false, click on the configure element if the configure panel is not already open
      if (!(await this.configureOpen.isVisible())) {
        await this.configure.click();
      }
    }

    // Wait for the configure panel to open
    await this.configureOpen.waitFor();

    // Return true if the configure panel is open
    return await this.configureOpen.isVisible();
  }
}

// Define WidgetDetail class
export class WidgetDetail {
  readonly page: Page;
  private widgetPage: Locator;
  private openUD: Locator;
  private tabular: Locator;
  private noTabularData: Locator;
  private groupByAdd: Locator;
  private groupByEdit: Locator;
  private firstGroupBySelected: Locator;
  private attributeList: Locator;
  private groupByOptions: Locator;
  private colHeadsSelector: Locator;
  private secondGroupBySelected: Locator;
  private closeUD: Locator;
  private settingTabularSelector: Locator;
  private noTabularDataSelector: Locator;
  private settingListItemSelector: Locator;
  private searchTabularSelector: Locator;
  private colCustomizerUDDisabled: Locator;
  private colCustomizerUD: Locator;
  private settingsApplyUD: Locator;
  private widgetLoader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.widgetPage = page.locator("//div[@id='widget-page']");
    this.openUD = page.locator("//button/span[text()='Underlying Data']");
    this.tabular = page.locator(".rt-table");
    this.noTabularData = page.locator("//span[text()='No Tabular Data']");

    this.groupByAdd = page.locator(
      "//div[@id='groupbySection']/following-sibling::a"
    );
    this.groupByEdit = page.locator(
      "(//div[@id='groupbySection']/following-sibling::div//input)[last()]"
    );
    this.firstGroupBySelected = page.locator(
      "(//div[div[@id='groupbySection']]//div[contains(@class,'input-wrapper')])[1]//span[@title]"
    );
    this.attributeList = page.locator(
      "//div[contains(@class,' select-dropdown')]//div[@class='container']"
    );
    this.groupByOptions = page.locator(
      "//div[contains(@class,' select-dropdown')]/div/div/div//div/span[last()]"
    );
    this.colHeadsSelector = page.locator(
      "//div[contains(@class,'rt-thead')]/div/div"
    );
    this.secondGroupBySelected = page.locator(
      "(//div[div[@id='groupbySection']]//div[contains(@class,'input-wrapper')])[2]//span[@title]"
    );
    this.closeUD = page.locator(
      "//div[@class='title']/following-sibling::div/fw-button"
    );

    this.settingTabularSelector = page.locator(
      "//div[@class='dropdown']/div/button"
    ); // Update with your actual selector
    this.noTabularDataSelector = page.locator(
      "//span[text()='No Tabular Data']"
    ); // Update with your actual selector
    this.settingListItemSelector = page.locator(
      "//ul[contains(@class,'table-settings-menu')]//li//label"
    ); // Update with your actual selector
    this.searchTabularSelector = page.locator(
      "#widgetUnderlyingDataColumnChooserSearch"
    );
    this.colCustomizerUDDisabled = page.locator(
      "//button[@id='widgetUnderlyingDataColumnChooserExpand'][@disabled]"
    );
    this.colCustomizerUD = page.locator(
      "#widgetUnderlyingDataColumnChooserExpand"
    );
    this.settingsApplyUD = page.locator(
      "#widgetUnderlyingDataColumnChooserApply"
    );
    this.widgetLoader = page.locator("//div[@class='boxes']").first();
  }

  async verifyWidgetDetailOpen(): Promise<boolean> {
    const isVisible = await this.widgetPage.isVisible();
    return isVisible;
  }

  async verifyDefaultUdOption(): Promise<boolean> {
    const isVisible = await this.openUD.isVisible();
    return isVisible;
  }

  async openUnderlyingData(custom = false): Promise<boolean> {
    await this.openUD.click();

    // Add conditional wait if custom is true
    if (custom) {
      await this.page.waitForTimeout(30000); // Wait for 30 seconds
    }

    // Wait for the tabular element to appear
    await this.tabular.waitFor();

    // Check if the tabular or no_tabular_data is present (visible)
    const isTabularPresent = await this.tabular.isVisible();
    const isNoTabularDataPresent = await this.noTabularData.isVisible();

    return isTabularPresent || isNoTabularDataPresent;
  }

  async closeUnderlyingData() {
    // Click on the close UD button
    await this.closeUD.click();

    // Wait for the tabular element to be hidden
    await this.tabular.waitFor({ state: "hidden" });

    // Check if the tabular element is present
    return await this.tabular.isVisible();
  }

  async verifyGroupByWithUD(): Promise<boolean> {
    // Get the text of the first selected group by
    const firstCol = await this.firstGroupBySelected.textContent();

    // If open_UD is present, click it
    if (await this.openUD.isVisible()) {
      await this.openUD.click();
    }

    // Ensure the element is visible before scrolling into view
    await this.page.waitForSelector(".rt-thead > div > div", {
      state: "visible",
    });

    // Scroll to the column headers
    await this.page.evaluate(() => {
      document.querySelector(".rt-thead > div > div")?.scrollIntoView();
    });

    // Wait for all elements to be available
    await this.page.waitForSelector(".rt-thead > div > div");

    // Get text content of column header elements
    const elements = await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll(".rt-thead > div > div")).map(
        (element) => element.textContent
      );
    });

    // Check if second group by is present
    if (await this.secondGroupBySelected.isVisible()) {
      const secondCol = await this.secondGroupBySelected.textContent();

      // Return true if first and second columns match, otherwise false
      return (
        firstCol === (await elements[0]) && secondCol === (await elements[1])
      );
    } else {
      // Return true if only the first column matches
      return firstCol === (await elements[0]);
    }
  }

  async scrollToTop() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async addGroupBy(...fields: string[]) {
    // Scroll to the group by add button
    await this.groupByAdd.scrollIntoViewIfNeeded();

    // If group by edit is present and first group by is not selected, click the edit button
    if (
      (await this.groupByEdit.isVisible()) &&
      !(await this.firstGroupBySelected.isVisible())
    ) {
      await this.groupByEdit.click();
    } else {
      // If group by add button is present, click it, otherwise click the edit button
      if (await this.groupByAdd.isVisible()) {
        await this.groupByAdd.click();
      }
      await this.groupByEdit.click();
    }

    // Wait for attribute list to appear
    await this.attributeList.waitFor();

    // Enter the first field and search for it
    await this.groupByEdit.fill(fields[0]);
    const elements = await this.groupByOptions.elementHandles();

    let flagClicked = false;
    // Loop through the elements to find and click the matching field
    for (const element of elements) {
      const text = await element.innerText();
      if (text === fields[0]) {
        await element.click();
        flagClicked = true;
        break;
      }
    }

    // If not clicked, retry the process
    if (!flagClicked) {
      await this.groupByEdit.click();
      await this.attributeList.waitFor();
      await this.groupByEdit.fill(fields[0]);
      await this.page.waitForTimeout(2000); // Replace sleep with appropriate wait
      const retryElements = await this.groupByOptions.elementHandles();

      for (const element of retryElements) {
        const text = await element.innerText();
        if (text === fields[0]) {
          await element.click();
          break;
        }
      }
    }

    // Handle additional group by fields if provided
    for (let i = 1; i < fields.length; i++) {
      await this.groupByEdit.click(); // Click to focus on input box
      await this.groupByEdit.click(); // Click to show dropdown options
      await this.page.waitForTimeout(2000); // Replace sleep 2 with appropriate wait
      const groupByElements = await this.groupByOptions.elementHandles();

      for (const element of groupByElements) {
        const text = await element.innerText();
        if (text === fields[i]) {
          await element.click();
          break;
        }
      }
    }
  }

  async verifyTableHeader(cols: string[]): Promise<boolean> {
    // Step 1: Wait for the setting tabular to be clickable
    await this.settingTabularSelector.waitFor();

    // Step 2: Check if the tabular data is present
    const noTabularDataVisible = await this.noTabularDataSelector.isVisible();

    if (!noTabularDataVisible) {
      // Step 3: Wait for column headers and scroll into view
      await this.colHeadsSelector.first().waitFor();
     // await this.settingListItemSelector.first().waitFor();
      await this.colHeadsSelector.first().scrollIntoViewIfNeeded();

      // Step 4: Get all column header elements and check for the expected columns
      const elements = await this.colHeadsSelector.allTextContents();

      for (const col of cols) {
        const isColPresent = elements.some((text) => text.trim() === col);
        if (!isColPresent) {
          return false;
        }
      }
      return true;
    } else {
      // Step 5: Handle the case when no tabular data is present
      await this.settingTabularSelector.waitFor({ timeout: 5000 });
      await this.settingTabularSelector.click();
      await this.searchTabularSelector.waitFor();

      // Step 6: Search and verify each column
      for (const col of cols) {
        await this.searchTabularSelector.fill(col);
        const colInList = await this.settingTabColChecked(col);
        await colInList.waitFor();
        await this.searchTabularSelector.fill("");

        if (!(await colInList.isVisible())) {
          await this.settingTabularSelector.click();
          return false;
        }
      }
      return true;
    }
  }

  async settingTabColChecked(col) {
    return this.page.locator(
      `//li[contains(@class,'dropdown-item')]//label[text()='${col}' and ..//input[@value='true']]`
    );
  }

  // Method for adding a column in Underlying Data (UD) column customization
  async addColumnToUD(...colNames: string[]) {
    await this.colCustomizerUDDisabled.waitFor({ state: "hidden" });

    if (!(await this.searchTabularSelector.isVisible())) {
      await this.colCustomizerUD.click();
    }

    for (const col of colNames) {
      await this.searchTabularSelector.fill(col);

      const colInList = this.settingUDColName(col); // Define this method or locator
      await this.page.evaluate(
        (element) => element.scrollIntoView(),
        await this.settingsApplyUD.elementHandle()
      );

      const colChecked = await this.settingUDColChecked(col); // Define this method or locator
      if (!(await colChecked.isVisible())) {
        await colInList.click();
      }

      await this.searchTabularSelector.fill(""); // Clear the search box after each iteration
    }

    await this.settingsApplyUD.click();

    try {
    if (await this.widgetLoader.isVisible()) {
      await this.widgetLoader.first().waitFor({ state: "hidden", timeout: 5000 });
    }
  } catch(e){}
  }

  // Method to wait for column customizer UD to be clickable
  async waitForAddColumnUD() {
    await this.colCustomizerUDDisabled.waitFor({
      state: "hidden",
    });
    await this.colCustomizerUD.waitFor({
      state: "visible",
      timeout: 10000,
    });
  }

  async waitForWidgetLoad() {
    try {
    await this.widgetLoader.waitFor({ state: 'visible', timeout: 5000 });
    await this.widgetLoader.waitFor({ state: 'hidden' });
    } catch(e){}
  }

  // Helper method to locate the column name in the UD list
  private settingUDColName(colName: string): Locator {
    return this.page.locator(`//ul[contains(@class,'table-settings-menu')]//label[text()='${colName}']`);
  }

  // Helper method to check if the column in UD list is already checked
  private settingUDColChecked(colName: string): Locator {
    return this.page.locator(`//li[contains(@class,'dropdown-item')]//label[text()='${colName}' and ..//input[@value='true']]`);
  }
}
