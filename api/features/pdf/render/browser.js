import puppeteer from "puppeteer";

// Chromium takes a second or so to start, and the previous code paid that on
// every PDF request. One instance is launched lazily and shared; only the page
// is per-render. The launch promise itself is cached so concurrent first
// requests wait on the same startup instead of racing to launch several.
let browserPromise = null;

async function launch() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  // If it dies (crash, OOM, external kill) drop the handle so the next render
  // launches a fresh one rather than reusing a dead browser forever.
  browser.on("disconnected", () => {
    browserPromise = null;
  });

  return browser;
}

function getBrowser() {
  if (!browserPromise) {
    browserPromise = launch().catch((err) => {
      browserPromise = null;
      throw err;
    });
  }
  return browserPromise;
}

const DEFAULT_PDF_OPTIONS = {
  format: "A4",
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: `
      <div style="font-size:10px; width:100%; text-align:right; padding-right:20px;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>`,
  footerTemplate: `<div></div>`,
  margin: { top: "20px", bottom: "20px", left: "15px", right: "15px" },
};

export async function renderPdf(html, pdfOptions = {}) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: "networkidle0" });
    return await page.pdf({ ...DEFAULT_PDF_OPTIONS, ...pdfOptions });
  } finally {
    // Closing the page is what reclaims the memory; the browser stays up.
    await page.close();
  }
}

// For graceful shutdown, and so tests do not leave Chromium running.
export async function closeBrowser() {
  if (!browserPromise) return;
  const pending = browserPromise;
  browserPromise = null;
  const browser = await pending.catch(() => null);
  if (browser) await browser.close();
}
