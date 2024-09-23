import { test, expect, Page } from "@playwright/test";
import { HomePage, Filter, ReportGroup, WidgetDetail } from "./PageObjectModel";
import { Severity, description, severity } from "allure-js-commons";

// https://github.com/freshdesk/reports-automation/blob/bc568c1a87ae552a9fb402f78203e12fff3fe43b/analytics/spec/Analytics_UI/Common/widget_detail_spec.rb

let page: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext(); // Create a new browser context
  page = await context.newPage();
});

test.describe("TC-119: Verify show tabular data and open tabular data", () => {
  test("should verify the tabular data functionality", async () => {
    
    /** use custom tags for allure */
    description("testing descruption");
    severity(Severity.CRITICAL)
    
    await page.goto(
      "https://fv-prestaging.freshreports.com/?appName=freshservice&auth=eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFMyNTYifQ.eyJmaXJzdE5hbWUiOiJGcmVzaHJlcG9ydHMiLCJsYXN0TmFtZSI6IkF1dG9tYXRpb24iLCJlbWFpbCI6InJhdmkucHJhc2FudGhAZnJlc2h3b3Jrcy5jb20iLCJ1c2VySWQiOjEzNjA3LCJzZXNzaW9uRXhwaXJhdGlvbiI6MTc1NDY0MDU2MCwidGVuYW50SWQiOjEwMDAwMDY2MCwidGltZXpvbmUiOiJBc2lhL0tvbGthdGEiLCJwb3J0YWxVcmwiOiJodHRwOi8vZmViMDEuZnJlc2hjbWRiLmNvbSJ9.U4VHVoS6wfkKnsh6BxzlPL1jwT0GswVySJiWMq2L6wA"
    );
    const homepage = new HomePage(page);
    const reportGroup = new ReportGroup(page);
    const filter = new Filter(page);
    const widgetDetail = new WidgetDetail(page);

    // Step 1: Create a report
    await homepage.createReport();

    // Step 2: Add widget to the report
    await reportGroup.addWidget();

    // Step 3: Wait for success message
    await homepage.waitForSuccessMessage();

    // Step 4: Open filter panel and remove all filters
    await filter.openFilterPanel();
    await filter.removeAllFilters();
    await filter.clickApply();

    // Step 5: Save the report
    await reportGroup.saveReport();

    // Step 6: Change report mode
    await reportGroup.changeReportMode();

    // Step 7: Expand widget
    await reportGroup.expandWidget();

    // Step 8: Verify widget detail is open
    expect(await widgetDetail.verifyWidgetDetailOpen()).toBe(true);

    // Step 9: Remove all filters, remove group by, and apply filters again
    await filter.removeAllFilters();
    await filter.removeGroupBy();
    await filter.clickApply();

    // Step 10: Open filter panel again, remove filters, and apply
    await filter.openFilterPanel();
    await filter.removeAllFilters();
    await filter.clickApply();

    // Step 11: Verify default underlying data option and open underlying data
    expect(await widgetDetail.verifyDefaultUdOption()).toBe(true);
    expect(await widgetDetail.openUnderlyingData()).toBe(true);
  });
});

test.describe("TC-121: Verify add column to tabular data", () => {
  test("should verify adding a column to tabular data", async () => {
    const widgetDetail = new WidgetDetail(page);
    const reportGroup = new ReportGroup(page);

    await widgetDetail.closeUnderlyingData();

    // Step 1: Open underlying data
    await widgetDetail.openUnderlyingData();

    // Step 2: Add "Created Date" column to the table
    await widgetDetail.addColumnToUD("Created Date");

    // Step 3: Verify that "Created Date" column is present in the table headers
    const isHeaderPresent = await widgetDetail.verifyTableHeader([
      "Created Date",
    ]);

    console.log({ isHeaderPresent })
    expect(isHeaderPresent).toBe(true);

    await widgetDetail.closeUnderlyingData();

    // Step 4: Save the report
    await reportGroup.saveReport();

    // Step 5: Wait for the widget to finish loading
    await widgetDetail.waitForWidgetLoad();

    console.log("Widget loaded");

    // Step 6: Change the report mode
    await reportGroup.changeReportMode();

    console.log("Report mode changed");
    // Step 7: Scroll to the top of the page
    await widgetDetail.scrollToTop();
  });
});

test.describe("TC-243: Verify single group by - updated column in tabular data", () => {
  test("should verify the updated column in tabular data when single group by is applied", async () => {
    const widgetDetail = new WidgetDetail(page);
    const filter = new Filter(page);

    // Step 1: Open configure panel
    await filter.openConfigurePanel();

    // Step 2: Add group by "Priority"
    await widgetDetail.addGroupBy("Priority");

    // Step 3: Apply the filter
    await filter.clickApply();

    // Step 4: Verify group by with underlying data
    const isGroupByValid = await widgetDetail.verifyGroupByWithUD();
    expect(isGroupByValid).toBe(true);

    // Step 5: Scroll to the top
    await widgetDetail.scrollToTop();
  });
});

test.describe("TC-252: Verify double group by - updated column in tabular data", () => {
  test("should verify the updated column in tabular data when double group by is applied", async () => {
    const widgetDetail = new WidgetDetail(page);
    const filter = new Filter(page);

    // Step 1: Close underlying data
    await widgetDetail.closeUnderlyingData();

    // Step 2: Open configure panel
    //await filter.openConfigurePanel();

    // Step 3: Add group by "Priority"
    await widgetDetail.addGroupBy("Category");

    // Step 4: Apply the filter
    await filter.clickApply();

    // Step 5: Verify group by with underlying data
    const isGroupByValid = await widgetDetail.verifyGroupByWithUD();
    expect(isGroupByValid).toBe(true);

    // Step 6: Scroll to the top
    // await widgetDetail.scrollToTop();
  });
});

test.describe("TC-130: Verify save button functionality", () => {
  test("should verify the save button and table header", async () => {
    const reportGroup = new ReportGroup(page);
    const widgetDetail = new WidgetDetail(page);
    
    // Step 3: Verify table header
    const isHeaderVerified = await widgetDetail.verifyTableHeader([
      "Created Date",
    ]);
    expect(isHeaderVerified).toBe(true);

    // Step 4: Scroll to the top
    await widgetDetail.scrollToTop();

    await widgetDetail.closeUnderlyingData();
    
    // Step 1: Save the report
    await reportGroup.saveReport();

    // Step 2: Change report mode
    await reportGroup.changeReportMode();
  });
});
