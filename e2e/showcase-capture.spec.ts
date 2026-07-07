import { expect, test } from "@playwright/test";
import path from "node:path";

test.use({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });

test("capture production showcase preview", async ({ page }) => {
  test.skip(test.info().project.name !== "chromium", "Desktop capture produces the submission image.");
  await page.goto("/time-machine?showcase=1");
  await expect(page.getByRole("heading", { name: /career time machine/i })).toBeVisible();
  await page.waitForTimeout(900);
  await page.screenshot({
    path: path.resolve("public", "handshake-preview.png"),
    fullPage: false
  });

  await page.goto("/?showcase=1");
  await expect(page.getByRole("heading", { name: /careertwin os/i })).toBeVisible();
  await page.waitForTimeout(900);
  await page.screenshot({
    path: path.resolve("public", "og-image.png"),
    fullPage: false
  });
});
