import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173/trifecta';
const errors = [];

async function test(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`);
    errors.push(name);
  }
}

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

page.on('pageerror', (err) => errors.push(`PAGE ERROR: ${err.message}`));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`CONSOLE: ${msg.text()}`);
});

await test('Today page loads', async () => {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Good', { timeout: 10000 });
});

await test('Tab navigation works', async () => {
  await page.getByRole('link', { name: 'Tasks' }).click();
  await page.waitForSelector('h1:text-is("Tasks")');
  await page.getByRole('link', { name: 'Money' }).click();
  await page.waitForSelector('h1:text-is("Money")');
  await page.getByRole('link', { name: 'Train' }).click();
  await page.waitForSelector('h1:text-is("Training")');
  await page.getByRole('link', { name: 'Progress' }).click();
  await page.waitForSelector('h1:text-is("Progress")');
  await page.getByRole('link', { name: 'Today' }).click();
  await page.waitForSelector('text=Good');
});

await test('Add task flow', async () => {
  await page.goto(`${BASE}/tasks`, { waitUntil: 'networkidle' });
  await page.locator('button', { hasText: '+' }).last().click();
  await page.waitForSelector('text=Add Task');
  await page.fill('input[placeholder="What needs doing?"]', 'E2E test task');
  await page.locator('.fixed').getByRole('button', { name: 'Today' }).click();
  await page.locator('.fixed').getByRole('button', { name: 'Save' }).click();
  await page.waitForSelector('text=E2E test task', { timeout: 5000 });
});

await test('Check off task', async () => {
  const checkbox = page.locator('text=E2E test task').locator('..').locator('..').locator('button').first();
  await checkbox.click();
  await page.waitForTimeout(500);
});

await test('Add expense flow', async () => {
  await page.goto(`${BASE}/money`, { waitUntil: 'networkidle' });
  await page.locator('button', { hasText: '+' }).last().click();
  await page.waitForSelector('text=Add Transaction');
  await page.fill('input[placeholder="0.00"]', '25.50');
  await page.click('button:text("Food")');
  await page.click('button:text("Save")');
  await page.waitForTimeout(1000);
});

await test('Start workout flow', async () => {
  await page.goto(`${BASE}/train`, { waitUntil: 'networkidle' });
  const startBtn = page.locator('button', { hasText: /Start workout|Continue/ }).first();
  await startBtn.click({ timeout: 5000 });
  await page.waitForSelector('text=Finish workout', { timeout: 5000 });
  await page.locator('button', { hasText: '✓ Log set' }).first().click();
  await page.waitForTimeout(500);
  await page.click('text=Finish workout');
  await page.waitForSelector('h1:text("Training")', { timeout: 5000 });
});

await test('Settings page loads', async () => {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.click('button:text("⚙")');
  await page.waitForSelector('h1:text("Settings")');
  await page.waitForSelector('text=Export JSON backup');
});

await test('Direct subroute loads (SPA)', async () => {
  await page.goto(`${BASE}/tasks`, { waitUntil: 'networkidle' });
  await page.waitForSelector('h1:text-is("Tasks")', { timeout: 5000 });
});

await browser.close();

if (errors.length > 0) {
  console.error('\nFailed tests/errors:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

console.log('\nAll tests passed!');