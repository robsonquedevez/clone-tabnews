import database from "infra/database";
import { ValidationError } from "infra/errors";

async function create(inputUserValues) {
  await validateUniqueEmail(inputUserValues.email);

  await validateUniqueUsername(inputUserValues.username);

  const newUser = await runInserQuery(inputUserValues);

  return newUser;

  async function validateUniqueUsername(username) {
    const results = await database.query({
      text: `
      SELECT 
        username
      FROM 
        users 
      WHERE 
        LOWER(username) = LOWER($1)`,
      values: [username],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O nome de usuário informado já está sendo utilizado.",
        action: "Utilize outro nome de usuário para realizar o cadastro.",
      });
    }
  }

  async function validateUniqueEmail(email) {
    const results = await database.query({
      text: `
      SELECT 
        email
      FROM 
        users 
      WHERE 
        LOWER(email) = LOWER($1)`,
      values: [email],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar o cadastro.",
      });
    }
  }

  async function runInserQuery({ username, email, password }) {
    const results = await database.query({
      text: `
      INSERT INTO 
        users (username, email, password) 
      VALUES 
        ($1, $2, $3)
      RETURNING
      *
      ;`,
      values: [username, email, password],
    });

    return results.rows[0];
  }
}

const user = {
  create,
};

export default user;
