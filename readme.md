
## Installation

yarn 
npx playwright install

Node 20.0 version

## Run spec tests

npx playwright test "widget.spec.ts" 

### Debug mode
npx playwright test "widget.spec.ts" --debug                 

### UI mode 
npx playwright test "widget.spec.ts" --ui 


### Email content check -> poc with node -> imap and mailparser
node email-content-check

### PDF content check -> poc with node -> imap and pdf-parser
node pdf-email-content-check

### HTML reporter
yarn html-report

### Allure reporter
yarn allure-report


