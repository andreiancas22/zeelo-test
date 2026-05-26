import { test, expect } from "@fixtures";
import { addTaskViaUI } from "@helpers/test-utils";

test.describe("Task Management", () => {
  test("should add a new task", async ({ authenticatedPage: page }) => {
    await addTaskViaUI(page, "Buy groceries", "medium");

    const taskItem = page.locator("ul#task-list > li");
    await expect(taskItem).toHaveCount(1);
    await expect(taskItem.locator("span:nth-child(2)")).toHaveText("Buy groceries");
  });

  test("should mark a task as completed", async ({ authenticatedPage: page }) => {
    await addTaskViaUI(page, "Test task");

    const taskItem = page.locator(".task-item", { hasText: "Test task" });
    await taskItem.locator("input[type='checkbox']").click();
    await expect(taskItem).toHaveClass(/completed/);
  });

  test("should delete a task", async ({ authenticatedPage: page }) => {
    const title = "Task to delete";
    await addTaskViaUI(page, title);

    await page.locator(".task-item", { hasText: title }).getByLabel("Delete task").click();
    await expect(page.getByText(title)).not.toBeVisible();
  });

  test("should display correct task count", async ({ authenticatedPage: page }) => {
    const tasks = ["Task 1", "Task 2", "Task 3"];

    for (const task of tasks) {
      await addTaskViaUI(page, task);
    }

    await expect(page.locator("#task-count")).toHaveText(
      "3 of 3 tasks remaining"
    );
  });

  test("should mark a completed task as incomplete", async ({ authenticatedPage: page }) => {
    await addTaskViaUI(page, "Toggle task");

    const taskItem = page.locator(".task-item", { hasText: "Toggle task" });
    const checkbox = taskItem.locator("input[type='checkbox']");

    await checkbox.click();
    await expect(taskItem).toHaveClass(/completed/);

    await checkbox.click();
    await expect(taskItem).not.toHaveClass(/completed/);
  });

  test("should render priority badges for all priorities", async ({ authenticatedPage: page }) => {
    await addTaskViaUI(page, "Low task", "low");
    await addTaskViaUI(page, "Medium task", "medium");
    await addTaskViaUI(page, "High task", "high");

    const badgeFor = (title: string) =>
      page.locator(".task-item", { hasText: title }).locator(".priority-badge");

    await expect(badgeFor("Low task")).toHaveClass(/low/);
    await expect(badgeFor("Low task")).toHaveText("low");

    await expect(badgeFor("Medium task")).toHaveClass(/medium/);
    await expect(badgeFor("Medium task")).toHaveText("medium");

    await expect(badgeFor("High task")).toHaveClass(/high/);
    await expect(badgeFor("High task")).toHaveText("high");
  });
});
