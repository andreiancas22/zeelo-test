import { test as base, expect, Page } from "@playwright/test";

type Fixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ page, request }, use, testInfo) => {
    const username = `u${testInfo.workerIndex}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const password = "test-pass";

    const createResponse = await request.post("/api/users", {
      data: { username, password, name: username },
    });

    expect(createResponse.ok()).toBeTruthy();

    await page.goto("/login");
    await page.fill("#username", username);
    await page.fill("#password", password);
    await page.click("#login-btn");
    await page.waitForURL("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#task-count")).toBeVisible();

    await use(page);

    const tasksResponse = await page.request.get("/api/tasks");
    const tasks = await tasksResponse.json();

    for (const task of tasks) {
      const deleteResponse = await page.request.delete(`/api/tasks/${task.id}`);
      expect(deleteResponse.ok()).toBeTruthy();
    }

    const verifyResponse = await page.request.get("/api/tasks");
    expect(await verifyResponse.json()).toEqual([]);
  },
});

export { expect };
