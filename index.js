import executablePath from 'puppeteer-core';
import puppeteerExtra from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';

export async function scrape(url) {
  console.log('scraping', url);
  try {
    puppeteerExtra.use(stealthPlugin());
    const browser = await puppeteerExtra.launch({
      headless: false,
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    });
    const page = await browser.newPage();

    // Intercept network requests
    /*    await page.setRequestInterception(true);

    page.on('request', (request) => {
      if (request.url().startsWith('https://reporting.cdndex.io/error')) {
        // Intercept the tracking request
        console.log('Intercepted tracking request:', request.url());

        // Abort the original request
        request.abort();

     fetch('https://reporting.cdndex.io/error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page_url: 'https://www.chewy.com/',
            event_type: 'PAGE_VIEW',
            pixel_id: 'mock-pixel-id',
            gtmTagId: 1234,
            gtmEventId: 5678,
            integration: 'mock',
          }),
        }); 
      } else {
        // Allow other requests to continue
        request.continue();
      }
    }); */

    // Listen for console messages from the page
    /*     page.on('console', (msg) => {
      console.log(`PAGE LOG: ${msg.type().toUpperCase()} ${msg.text()}`);
    });

    // Listen for uncaught errors and exceptions
    page.on('pageerror', (err) => {
      console.error('PAGE ERROR:', err);
    });

    // Listen for failed requests
    page.on('requestfailed', (request) => {
      console.log(
        `REQUEST FAILED: ${request.url()} ${request.failure().errorText}`
      );
    });

    // Listen for responses
    page.on('response', async (response) => {
      console.log(`RESPONSE: ${response.url()} ${response.status()}`);
      if (response.status() >= 400) {
        // Log error responses
        console.error(
          `ERROR RESPONSE: ${response.url()} ${response.status()} ${response.statusText()}`
        );
        try {
          const body = await response.text();
          console.error('  Response Body:', body); // Log response body for debugging
        } catch (e) {
          console.error('  Error reading response body:', e.message);
        }
      }
    });
 */
    // Mix up user agents to make it look like a real user using different browsers
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    ];

    const randomUserAgent =
      userAgents[Math.floor(Math.random() * userAgents.length)];
    await page.setUserAgent(randomUserAgent);

    // Add headers to make the website think you are not a bot

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    });

    // add delays to make website think you are not a bot
    // Delay function
    function delay(time) {
      return new Promise(function (resolve) {
        setTimeout(resolve, time);
      });
    }

    // Set a Realistic Viewport
    await page.setViewport({ width: 1366, height: 768 });

    // Handle Cookies (clear them)
    const context = browser.defaultBrowserContext();
    context.overridePermissions(url, ['notifications']);
    await page.deleteCookie(...(await page.cookies()));

    await page.goto(url);
    await delay(Math.random() * 2000 + 1000);
    await page.screenshot({ path: 'example.png' });
    const h1 = await page.$$eval('h1', (elements) =>
      elements.map((el) => el.innerText || el.textContent)
    );
    console.log('h1', h1);
    // const textSelector = await page.locator('title').waitHandle();
    //const fullTitle = await textSelector?.evaluate((el) => el.textContent);
    // console.log('fullTitle', fullTitle);

    // Extract text content from h1 to p elements
    const allText = await page.$$eval(
      'h1, h2, h3, h4, h5, h6, p',
      (elements) => {
        return elements.map((el) => el.innerText || el.textContent).join('\n');
      }
    );

    console.log('allText', allText); // Log all text content

    // Recursive function to extract text from div and span elements
    async function extractText(page) {
      const elements = await page.$$('div, span');
      let allText = '';
      const seenText = new Set(); // Keep track of text we've already seen

      for (const element of elements) {
        const childElements = await element.$$('*'); // Select all child elements
        if (childElements.length === 0) {
          // If no child elements, extract text
          const text = await element.evaluate(
            (el) => el.innerText || el.textContent
          );
          if (text && !seenText.has(text)) {
            allText += text + '\n';
            seenText.add(text);
          }
          allText += text + '\n';
        } else {
          // If child elements exist, recursively process them
          const text = await element.evaluate(
            (el) => el.innerText || el.textContent
          );
          allText += text + '\n';
        }
      }
      return seenText;
    }

    await delay(Math.random() * 2000 + 1000);

    const divSpanText = await extractText(page);
    console.log('divSpanText', divSpanText);

    await delay(Math.random() * 2000 + 1000);

    async function getFaviconUrl(page) {
      try {
        // Try to find a favicon link element
        const faviconLink = await page.$('link[rel="icon"]');
        if (faviconLink) {
          const faviconUrl = await page.evaluate(
            (link) => link.href,
            faviconLink
          );
          return faviconUrl;
        } else {
          console.log(
            'No favicon <link> found, attempting to construct from /favicon.ico'
          );
          // If no link element, try constructing the URL from /favicon.ico
          const pageUrl = page.url();
          const baseUrl = new URL(pageUrl).origin;
          return `${baseUrl}/favicon.ico`;
        }
      } catch (error) {
        console.error('Error getting favicon URL:', error.message);
        return null;
      }
    }

    const faviconUrl = await getFaviconUrl(page);
    console.log('Favicon URL:', faviconUrl);

    // Locate the text input, type into it, and click the button
    async function interactWithForm(page) {
      try {
        // Replace 'input[type="text"]' with the actual selector for your text input
        await page.type('input[type="text"]', 'https://chewy.com');

        // Replace 'button[type="submit"]' with the actual selector for your button
        await page.click('button[type="submit"]');

        console.log('Form interaction successful');
      } catch (error) {
        console.error('Error interacting with form:', error.message);
      }
    }

    await interactWithForm(page);

    await browser.close();
    console.log('success');
    return { message: 'Scraping successful' };
  } catch (error) {
    console.log('error at scrape function', error.message);
    return { error: error.message };
  }
}

// Command line argument handling
const url = process.argv[2]; // Get the URL from command line arguments
if (!url) {
  console.error('Please provide a URL as a command line argument.');
  process.exit(1);
}
scrape(url);
