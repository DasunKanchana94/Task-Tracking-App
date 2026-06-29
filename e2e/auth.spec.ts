import { expect, test } from "@playwright/test";

test.describe("Authentication", () => {
  test("unauthenticated users are redirected to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("login page renders the credentials form and Google option", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
  });

  test("navigating to register shows the sign-up form", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  });

  test("submitting invalid credentials shows a validation error", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("x");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
  });
});
