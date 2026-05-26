import { test, expect } from "./fixtures";
import { addTaskViaUI } from "./helpers/test-utils";

test.describe("Task Filtering", () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await addTaskViaUI(page, "Active task 1", "low");
    await addTaskViaUI(page, "Active task 2", "high");
  });

  test("should filter active tasks", async ({ authenticatedPage: page }) => {
    await page
      .locator(".task-item", { hasText: "Active task 1" })
      .locator("input[type='checkbox']")
      .click();

    await expect(
      page.locator(".task-item", { hasText: "Active task 1" })
    ).toHaveClass(/completed/);

    await page.locator('[data-filter="active"]').click();

    await expect(page.getByText("Active task 2")).toBeVisible();
    await expect(page.getByText("Active task 1")).not.toBeVisible();
  });

  test("should filter completed tasks", async ({ authenticatedPage: page }) => {
    await page
      .locator(".task-item", { hasText: "Active task 1" })
      .locator("input[type='checkbox']")
      .click();

    await expect(
      page.locator(".task-item", { hasText: "Active task 1" })
    ).toHaveClass(/completed/);

    await page.locator('[data-filter="completed"]').click();

    await expect(page.getByText("Active task 1")).toBeVisible();
    await expect(page.getByText("Active task 2")).not.toBeVisible();
  });
});
