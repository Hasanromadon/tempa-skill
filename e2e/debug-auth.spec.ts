import { test, expect } from "@playwright/test";

test("debug invalid login flow", async ({ page }) => {
  // Enable console logging
  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
  page.on("pageerror", (error) => console.log("PAGE ERROR:", error.message));

  // Log network requests
  page.on("request", (request) => {
    if (request.url().includes("/auth/login")) {
      console.log("REQUEST:", request.method(), request.url());
      console.log("POST DATA:", request.postData());
    }
  });

  page.on("response", async (response) => {
    if (response.url().includes("/auth/login")) {
      console.log("RESPONSE:", response.status(), response.statusText());
      try {
        const body = await response.text();
        console.log("RESPONSE BODY:", body);
      } catch (e) {
        console.log("Could not read response body");
      }
    }
  });

  await page.goto("/login");

  console.log("Filling form with invalid credentials...");
  await page.fill('input[id="email"]', "wrong@example.com");
  await page.fill('input[id="password"]', "wrongpassword");

  console.log("Clicking submit...");
  await page.click('button[type="submit"]');

  console.log("Waiting 3 seconds to see what happens...");
  await page.waitForTimeout(3000);

  console.log("Current URL:", page.url());

  // Check for any error messages
  const allErrors = await page.locator(".text-red-600").allTextContents();
  console.log("All .text-red-600 elements:", allErrors);

  const bgRedErrors = await page
    .locator(".bg-red-50 .text-red-600")
    .allTextContents();
  console.log("Errors in .bg-red-50:", bgRedErrors);

  // Take a screenshot for visual inspection
  await page.screenshot({ path: "debug-invalid-login.png", fullPage: true });
  console.log("Screenshot saved as debug-invalid-login.png");
});

test("debug registration flow", async ({ page }) => {
  // Enable console logging
  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
  page.on("pageerror", (error) => console.log("PAGE ERROR:", error.message));

  // Log network requests
  page.on("request", (request) => {
    if (request.url().includes("/auth/register")) {
      console.log("REQUEST:", request.method(), request.url());
      console.log("POST DATA:", request.postData());
    }
  });

  page.on("response", async (response) => {
    if (response.url().includes("/auth/register")) {
      console.log("RESPONSE:", response.status(), response.statusText());
      try {
        const body = await response.text();
        console.log("RESPONSE BODY:", body);
      } catch (e) {
        console.log("Could not read response body");
      }
    }
  });

  await page.goto("/register");

  console.log("Filling form...");
  await page.fill('input[name="name"]', "Debug User");
  await page.fill('input[name="email"]', `debug-${Date.now()}@test.com`);
  await page.fill('input[name="password"]', "password123");
  await page.fill('input[name="password_confirmation"]', "password123");

  console.log("Clicking submit...");
  await page.click('button[type="submit"]');

  console.log("Waiting 5 seconds to see what happens...");
  await page.waitForTimeout(5000);

  console.log("Current URL:", page.url());

  // Check for any visible error messages
  const errorText = await page
    .locator('[role="alert"], .alert, [class*="error"]')
    .allTextContents();
  console.log("Error messages:", errorText);

  // Check localStorage
  const token = await page.evaluate(() => localStorage.getItem("auth_token"));
  console.log("Token in localStorage:", token ? "EXISTS" : "NULL");

  // Check cookies
  const cookies = await page.context().cookies();
  console.log(
    "Cookies:",
    cookies.map((c) => `${c.name}=${c.value.substring(0, 20)}...`)
  );
});
