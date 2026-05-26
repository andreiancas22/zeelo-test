import { test, expect } from "@playwright/test";

const password = "test-pass";

function uniqueUsername(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

test.describe("User Management API", () => {
  test("should create a user via the API", async ({ request }) => {
    const username = uniqueUsername("create");

    const response = await request.post("/api/users", {
      data: { username, password, name: username },
    });
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.user.username).toBe(username);
  });

  test("should reject a duplicate username", async ({ request }) => {
    const username = uniqueUsername("dup");

    const first = await request.post("/api/users", {
      data: { username, password },
    });
    expect(first.status()).toBe(201);

    const second = await request.post("/api/users", {
      data: { username, password },
    });
    expect(second.status()).toBe(409);
  });

  test("should reject missing username", async ({ request }) => {
    const response = await request.post("/api/users", {
      data: { password },
    });
    expect(response.status()).toBe(400);
  });

  test("should reject missing password", async ({ request }) => {
    const response = await request.post("/api/users", {
      data: { username: uniqueUsername("nopw") },
    });
    expect(response.status()).toBe(400);
  });
});

test.describe("Cross-user task isolation", () => {
  test("a user only sees their own tasks via GET /api/tasks", async ({ playwright, baseURL }) => {
    const userA = uniqueUsername("a");
    const userB = uniqueUsername("b");

    const requestA = await playwright.request.newContext({ baseURL });
    const requestB = await playwright.request.newContext({ baseURL });

    await requestA.post("/api/users", { data: { username: userA, password } });
    await requestA.post("/api/users", { data: { username: userB, password } });

    await requestA.post("/api/login", { data: { username: userA, password } });
    await requestB.post("/api/login", { data: { username: userB, password } });

    await requestA.post("/api/tasks", { data: { title: "A's task", priority: "low" } });
    await requestB.post("/api/tasks", { data: { title: "B's task", priority: "high" } });

    const aTasks = await (await requestA.get("/api/tasks")).json();
    const bTasks = await (await requestB.get("/api/tasks")).json();

    expect(aTasks).toHaveLength(1);
    expect(aTasks[0].title).toBe("A's task");

    expect(bTasks).toHaveLength(1);
    expect(bTasks[0].title).toBe("B's task");

    await requestA.dispose();
    await requestB.dispose();
  });

  test("a user cannot delete another user's task", async ({ playwright, baseURL }) => {
    const userA = uniqueUsername("a");
    const userB = uniqueUsername("b");

    const requestA = await playwright.request.newContext({ baseURL });
    const requestB = await playwright.request.newContext({ baseURL });

    await requestA.post("/api/users", { data: { username: userA, password } });
    await requestA.post("/api/users", { data: { username: userB, password } });

    await requestA.post("/api/login", { data: { username: userA, password } });
    await requestB.post("/api/login", { data: { username: userB, password } });

    const createResponse = await requestA.post("/api/tasks", {
      data: { title: "A's protected task" },
    });
    const createdTask = await createResponse.json();

    const deleteResponse = await requestB.delete(`/api/tasks/${createdTask.id}`);
    expect(deleteResponse.status()).toBe(404);

    const aTasks = await (await requestA.get("/api/tasks")).json();
    expect(aTasks).toHaveLength(1);
    expect(aTasks[0].id).toBe(createdTask.id);

    await requestA.dispose();
    await requestB.dispose();
  });
});
