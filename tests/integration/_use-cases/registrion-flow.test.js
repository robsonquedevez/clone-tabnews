import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all successful)", () => {
  test("Create user account", async () => {
    const createUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "ResgistrationFlow",
          email: "resgistration.flow@qdvz.com.br",
          password: "Reg123@",
        }),
      },
    );

    expect(createUserResponse.status).toBe(201);

    const createUserResponseBody = await createUserResponse.json();

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "ResgistrationFlow",
      email: "resgistration.flow@qdvz.com.br",
      password: createUserResponseBody.password,
      features: ["read:activation_token"],
      created_at: createUserResponseBody.created_at,
      update_at: createUserResponseBody.update_at,
    });
  });

  test("Receive activation email", () => {});

  test("Login", () => {});

  test("Get user information", () => {});
});
