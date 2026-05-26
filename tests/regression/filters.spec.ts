import { test, expect } from "@fixtures";
import { addTaskViaUI } from "@helpers/test-utils";

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

  test("should show 'All' filter highlighted by default", async ({ authenticatedPage: page }) => {
    await expect(page.locator('[data-filter="all"]')).toHaveClass(/active/);
  });

  test("should move the active highlight when a different filter is clicked", async ({ authenticatedPage: page }) => {
    await page.locator('[data-filter="active"]').click();

    await expect(page.locator('[data-filter="active"]')).toHaveClass(/active/);
    await expect(page.locator('[data-filter="all"]')).not.toHaveClass(/active/);
    await expect(page.locator('[data-filter="completed"]')).not.toHaveClass(/active/);
  });

  test("'All' filter shows every task regardless of completion", async ({ authenticatedPage: page }) => {
    await page
      .locator(".task-item", { hasText: "Active task 1" })
      .locator("input[type='checkbox']")
      .click();
    await expect(
      page.locator(".task-item", { hasText: "Active task 1" })
    ).toHaveClass(/completed/);

    await page.locator('[data-filter="all"]').click();

    await expect(page.getByText("Active task 1")).toBeVisible();
    await expect(page.getByText("Active task 2")).toBeVisible();
  });

  test("should show empty state when filter matches no tasks", async ({ authenticatedPage: page }) => {
    await page.locator('[data-filter="completed"]').click();
    await expect(page.locator(".empty-state")).toHaveText("No tasks to display.");
  });
});

test.describe("Empty Task List", () => {
  test("should show empty state when there are no tasks", async ({ authenticatedPage: page }) => {
    await expect(page.locator(".empty-state")).toHaveText("No tasks to display.");
  });
});
