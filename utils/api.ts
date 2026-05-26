import { expect, Page, APIRequestContext } from "@playwright/test";

const JSON_HEADERS = { Accept: "application/json" };

export type Credentials = { username: string; password: string };

export const uniqueCredentials = (workerIndex: number): Credentials => ({
  username: `u${workerIndex}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  password: "test-pass",
});

export const createUser = async (
  request: APIRequestContext,
  creds: Credentials,
) => {
  const response = await request.post("/api/users", {
    data: { ...creds, name: creds.username },
  });
  expect(response.ok()).toBeTruthy();
};

export const loginAndOpenApp = async (page: Page, creds: Credentials) => {
  const response = await page.request.post("/api/login", { data: creds });
  expect(response.ok()).toBeTruthy();

  await page.goto("/");
  await expect(page.locator("#task-count")).toBeVisible();
};

export const deleteAllTasks = async (page: Page) => {
  const listResponse = await page.request.get("/api/tasks", { headers: JSON_HEADERS });

  if (listResponse.status() === 401) return;

  expect(listResponse.ok()).toBeTruthy();
  const tasks = await listResponse.json();

  for (const task of tasks) {
    const deleteResponse = await page.request.delete(`/api/tasks/${task.id}`);

    expect(deleteResponse.ok()).toBeTruthy();
  }

  const verifyResponse = await page.request.get("/api/tasks", { headers: JSON_HEADERS });

  expect(await verifyResponse.json()).toEqual([]);
};
