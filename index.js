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
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url);
    await page.screenshot({ path: 'example.png' });
    const h1 = await page.$$eval('h1', (elements) =>
      elements.map((el) => el.innerText || el.textContent)
    );
    console.log('h1', h1);
    /*     const textSelector = await page.locator('title').waitHandle();
    const fullTitle = await textSelector?.evaluate((el) => el.textContent);
    console.log('fullTitle', fullTitle); */

    // Extract text content from h1 to p elements
    /*     const allText = await page.$$eval(
      'h1, h2, h3, h4, h5, h6, p',
      (elements) => {
        return elements.map((el) => el.innerText || el.textContent).join('\n');
      }
    );

    console.log('allText', allText); */

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

    const divSpanText = await extractText(page);
    console.log('divSpanText', divSpanText);

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
