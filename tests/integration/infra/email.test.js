import email from "infra/email";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "QDVZ <oi@qdvz.com>",
      to: "contato@curso.dev",
      subject: "Teste de assunto",
      text: "Teste de corpo",
    });

    await email.send({
      from: "QDVZ <oi@qdvz.com>",
      to: "contato@curso.dev",
      subject: "Ultimo email enviado",
      text: "Corpo do ultimo email",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<oi@qdvz.com>");
    expect(lastEmail.recipients[0]).toBe("<contato@curso.dev>");
    expect(lastEmail.subject).toBe("Ultimo email enviado");
    expect(lastEmail.text).toBe("Corpo do ultimo email\n");
  });
});
