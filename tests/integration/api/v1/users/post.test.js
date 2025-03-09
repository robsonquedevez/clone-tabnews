import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "mickaelscot",
          email: "scot@dundermifflin.com",
          password: "Abc123@",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(201);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "mickaelscot",
        email: "scot@dundermifflin.com",
        password: "Abc123@",
        created_at: responseBody.created_at,
        update_at: responseBody.update_at,
      });
      expect(uuidVersion(responseBody.id)).toEqual(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.update_at)).not.toBeNaN();
    });

    test("With duplicated 'email'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicated1",
          email: "duplicado@dundermifflin.com",
          password: "Abc123@",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicated2",
          email: "Duplicado@dundermifflin.com",
          password: "Abc123@",
        }),
      });

      const response2Body = await response2.json();

      expect(response2.status).toBe(400);
      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar o cadastro.",
        status_code: 400,
      });
    });

    test("With duplicated 'username'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernameduplicated",
          email: "duplicado1@dundermifflin.com",
          password: "Abc123@",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "UsernameDuplicated",
          email: "duplicado2@dundermifflin.com",
          password: "Abc123@",
        }),
      });

      const response2Body = await response2.json();

      expect(response2.status).toBe(400);
      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O nome de usuário informado já está sendo utilizado.",
        action: "Utilize outro nome de usuário para realizar o cadastro.",
        status_code: 400,
      });
    });

    test("With nullable 'username'", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "",
          email: "nullable@dundermifflin.com",
          password: "Abc123@",
        }),
      });
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O nome de usuário não pode ser nulo.",
        action: "Informe um nome de usuário para realizar o cadastro.",
        status_code: 400,
      });
    });

    test("With nullable 'email'", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernameemailnullable",
          email: "",
          password: "abc123",
        }),
      });
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email não pode ser nulo.",
        action: "Informe um email para realizar o cadastro.",
        status_code: 400,
      });
    });

    test("With nullable 'password'", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernamepasswordnullable",
          email: "passwordnullable@dundermifflin.com",
          password: "",
        }),
      });
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "A senha não pode ser nula.",
        action: "Informe uma senha para realizar o cadastro.",
        status_code: 400,
      });
    });

    test("With inválids 'password' requirements", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernamepasswordnullable",
          email: "passwordnullable@dundermifflin.com",
          password: "abc1",
        }),
      });
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "A senha informado não atende os requisitos mínimos.",
        action:
          "Informe uma senha que contenha: letras minúscula, letras maiúscula, número, caractere especial(@$!%*?&) e no mínimo 6 caracteres.",
        status_code: 400,
      });
    });
  });
});
