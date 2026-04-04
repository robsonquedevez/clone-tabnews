import email from "infra/email";
import database from "infra/database";
import webserver from "infra/webserver";
import user from "models/user";
import authorization from "./authorization";
import { ForbiddenError } from "infra/errors";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newToken = await runInserQuery(userId, expiresAt);
  return newToken;

  async function runInserQuery(userId, expiresAt) {
    const result = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING *;
      `,
      values: [userId, expiresAt],
    });

    return result.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "QDVZ <oi@qdvz.com>",
    to: user.email,
    subject: "Ative seu cadastro",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro:

${webserver.origin}/cadastro/ativar/${activationToken.id}
    
    
Atenciosamente,
Time QDVZ`,
  });
}

async function findOneValidById(tokenProvider) {
  const newToken = await runSelectQuery(tokenProvider);
  return newToken;

  async function runSelectQuery(tokenProvider) {
    const result = await database.query({
      text: `
        SELECT
          *
        FROM 
          user_activation_tokens
        WHERE 
          id = $1
        AND
          expires_at > NOW()
        AND 
          used_at IS NULL
        LIMIT 1;
      `,
      values: [tokenProvider],
    });

    return result.rows[0];
  }
}

async function markTokenAsUsed(tokenProvider) {
  const usedActivationToken = await runUpdateQuery(tokenProvider);
  return usedActivationToken;

  async function runUpdateQuery(tokenProvider) {
    const result = await database.query({
      text: `
        UPDATE
          user_activation_tokens
        SET 
          used_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
        ;
      `,
      values: [tokenProvider],
    });

    return result.rows[0];
  }
}

async function activateUserByUserId(userId) {
  const userToActivate = await user.findOneById(userId);

  if (!authorization.can(userToActivate, "read:activation_token")) {
    throw new ForbiddenError({
      message: "Você não pode mais utilizar tokens de ativação.",
      action: "Entre em contato com o suporte.",
    });
  }

  const activatedUser = await user.setFeatures(userId, [
    "create:session",
    "read:session",
    "update:user",
  ]);
  return activatedUser;
}

const activation = {
  create,
  sendEmailToUser,
  findOneValidById,
  markTokenAsUsed,
  activateUserByUserId,
  EXPIRATION_IN_MILLISECONDS,
};

export default activation;
