# Puppeteer Scraper

This project is a simple web scraper built using Puppeteer. It allows you to scrape a given URL, take a screenshot of the page, and handle incoming events for scraping via a handler function.

## Files

- **index.js**: Contains the main logic for scraping a given URL using Puppeteer. It exports a function `scrape(url)` that launches a browser, navigates to the specified URL, takes a screenshot, and closes the browser. It also exports a handler function that processes incoming events, extracts the URL from the event body, and calls the `scrape` function.

- **package.json**: Configuration file for npm that lists the dependencies required for the project, such as Puppeteer and any other necessary packages, along with scripts for running the application.

## Usage

To run the scraper from the command line, follow these steps:

1. Ensure you have Node.js installed on your machine.
2. Install the required dependencies by running:
   ```
   npm install
   ```
3. Run the scraper with a URL as a command line argument:
   ```
   node index.js https://www.example.com
   ```
   Replace `https://www.example.com` with the URL you want to scrape.

## Notes

- Make sure to have a compatible version of Chrome installed, as the scraper uses Puppeteer to launch a browser instance.
- The screenshots will be saved in the project directory as `example.png`. You can modify the filename in the `index.js` file if needed.