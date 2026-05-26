import { test as base, expect, Page } from "@playwright/test";
import {
  uniqueCredentials,
  createUser,
  loginAndOpenApp,
  deleteAllTasks,
} from "@utils/api";

type Fixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ page, request }, use, testInfo) => {
    const creds = uniqueCredentials(testInfo.workerIndex);

    await createUser(request, creds);
    await loginAndOpenApp(page, creds);

    await use(page);

    await deleteAllTasks(page);
  },
});

export { expect };
