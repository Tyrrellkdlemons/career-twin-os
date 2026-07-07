import { expect, test } from "@playwright/test";

test("showcase reviewer can run the primary product flow", async ({ page, isMobile }) => {
  await page.goto("/?showcase=1");

  await expect(page.getByRole("heading", { name: /careertwin os/i })).toBeVisible();
  await expect(page.getByText(/fictional demo twin/i)).toBeVisible();

  await page.getByRole("link", { name: /simulate my future/i }).click();
  await expect(page.getByRole("heading", { name: /simulate competing futures/i })).toBeVisible();
  await expect(page.getByText(/fastest credible cloud route/i)).toBeVisible();

  await page.getByLabel(/ai adoption accelerates/i).check();
  await expect(page.getByText(/automation-heavy roles gain market signal/i)).toBeVisible();

  await page.getByRole("link", { name: isMobile ? /paths/i : /path race/i }).click();
  await expect(page.getByRole("heading", { name: /path race/i })).toBeVisible();
  await page.getByLabel(/speed/i).fill("90");
  await expect(page.getByText(/why this path wins/i)).toBeVisible();

  await page.getByRole("link", { name: /missions/i }).click();
  await expect(page.getByRole("heading", { name: /proof missions/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /deploy a fault-tolerant/i })).toBeVisible();

  if (isMobile) {
    await page.goto("/future-self?showcase=1");
  } else {
    await page.getByRole("link", { name: /future self/i }).click();
  }
  await expect(page.getByRole("heading", { name: /future self encounter/i })).toBeVisible();
  await page.getByRole("button", { name: /what should i do this week/i }).click();
  await expect(page.getByText(/complete the first slice/i)).toBeVisible();

  if (isMobile) {
    await page.goto("/decisions?showcase=1");
  } else {
    await page.getByRole("link", { name: /decisions/i }).click();
  }
  await page.getByLabel("Decision").fill("Build deployment proof first");
  await page.getByLabel("Expectation").fill("Improve interview credibility");
  await page.getByLabel("Success signal").fill("Three relevant recruiter replies");
  await page.getByRole("button", { name: /save decision/i }).click();
  await expect(page.getByText(/Build deployment proof first/i)).toBeVisible();
});

test("deep links survive direct navigation and mobile navigation is usable", async ({ page, isMobile }) => {
  await page.goto("/time-machine?showcase=1");
  await expect(page.getByRole("heading", { name: /career time machine/i })).toBeVisible();
  await expect(page.getByText(/scenario simulation/i)).toBeVisible();

  await page.goto("/evidence?showcase=1");
  await expect(page.getByRole("heading", { name: /evidence graph/i })).toBeVisible();
  await page.getByLabel(/github repository url/i).fill("https://github.com/Tyrrellkdlemons/career-twin-os");
  await expect(page.getByText(/supported public repository url/i)).toBeVisible();

  if (isMobile) {
    await expect(page.getByRole("navigation", { name: /mobile/i })).toBeVisible();
  }
});

test("API Finder surfaces open and official data sources", async ({ page }) => {
  await page.goto("/api-finder?showcase=1");
  await expect(page.getByRole("heading", { name: /open api finder/i })).toBeVisible();
  await page.getByLabel(/search apis/i).fill("labor skills");
  await expect(page.getByRole("heading", { name: /BLS Public Data API/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /O\*NET Web Services/i })).toBeVisible();
  await page.getByRole("button", { name: /no-key only/i }).click();
  await page.getByRole("button", { name: /^Research$/i }).click();
  await page.getByLabel(/search apis/i).fill("education research");
  await expect(page.getByText(/OpenAlex API/i)).toBeVisible();
});
