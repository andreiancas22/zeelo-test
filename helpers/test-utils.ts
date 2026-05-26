import { Page, expect } from "@playwright/test";

/**
 * Adds a task via the UI and waits for it to appear in the list.
 */
export async function addTaskViaUI(
  page: Page,
  title: string,
  priority: string = "low",
) {
  await page.fill(".form-row > input:first-child", title);
  await page.selectOption(".form-row > select", priority);
  await page.getByRole("button", { name: "Add Task" }).click();
  await expect(page.locator(".task-item", { hasText: title })).toBeVisible();
}
