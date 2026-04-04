import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With unique 'username'", async () => {
      await orchestrator.createUser({
        username: "anonymousUser1",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/anonymousUser1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toBe(403);
      expect(responseBody).toEqual({
        status_code: 403,
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação.",
        action: "Verifique se o seu usuário possui a feature \"update:user\"",
      });
    });
  });
  
  describe("Default user", () => {
    test("With nonexistent 'username'", async () => {
      const cratedUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(cratedUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Cookie": `session_id=${sessionObject.token}`,
          },
        },
      );

      const responseBody = await response.json();

      expect(response.status).toBe(404);
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique que o username está digitado corretamente.",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {    
      await orchestrator.createUser({
        username: "user1",
      });

      const createUser2 = await orchestrator.createUser({
        username: "user2",
      });
      const activatedUser2 = await orchestrator.activateUser(createUser2);
      const sessionObject2 = await orchestrator.createSession(activatedUser2.id);

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Cookie": `session_id=${sessionObject2.token}`,
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O nome de usuário informado já está sendo utilizado.",
        action: "Utilize outro nome de usuário para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "email1@dundermifflin.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "email2@dundermifflin.com",
      });
      const activatedUser2 = await orchestrator.activateUser(createdUser2);
      const sessionObject2 = await orchestrator.createSession(activatedUser2.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Cookie": `session_id=${sessionObject2.token}`,
          },
          body: JSON.stringify({
            email: "email1@dundermifflin.com",
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const createdUser =await orchestrator.createUser({
        username: "uniqueUser1",
      });
      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Cookie": `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser2",
        email: responseBody.email,
        password: responseBody.password,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        update_at: responseBody.update_at,
      });
      expect(uuidVersion(responseBody.id)).toEqual(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.update_at)).not.toBeNaN();
      expect(responseBody.update_at > responseBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        password: "NewPassword@1",
      });
      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Cookie": `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            password: "NewPassword@2",
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(uuidVersion(responseBody.id)).toEqual(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.update_at)).not.toBeNaN();
      expect(responseBody.update_at > responseBody.created_at).toBe(true);
      const userInDatabase = await user.findOneByUsername(
        responseBody.username,
      );
      const correctPasswordMatch = await password.compare(
        "NewPassword@2",
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare(
        "NewPassword@1",
        userInDatabase.password,
      );
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
