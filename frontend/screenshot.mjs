import { chromium } from 'playwright';

const pages = [
  { name: 'home', path: '/' },
  { name: 'trending', path: '/trending' },
  { name: 'categories', path: '/categories' },
  { name: 'classifieds', path: '/classifieds' },
  { name: 'profiles', path: '/profiles' },
  { name: 'chat', path: '/chat' },
];

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  for (const page of pages) {
    const tab = await context.newPage();
    await tab.goto(`http://localhost:5173${page.path}`, { waitUntil: 'networkidle' });
    await tab.waitForTimeout(1000);
    await tab.screenshot({ path: `/tmp/${page.name}.png`, fullPage: true });
    console.log(`Screenshot saved: /tmp/${page.name}.png`);
    await tab.close();
  }

  await browser.close();
}

main().catch(console.error);
