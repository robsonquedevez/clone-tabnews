import database from "infra/database";
import password from "models/password";
import { ValidationError, NotFoundError } from "infra/errors";

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
      SELECT 
        *
      FROM 
        users 
      WHERE 
        LOWER(username) = LOWER($1)
      LIMIT 1;  
      `,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique que o username está digitado corretamente.",
      });
    }

    return results.rows[0];
  }
}

async function create(inputUserValues) {
  await validateNullableValues(inputUserValues);
  await validateUniqueUsername(inputUserValues.username);
  await validateUniqueEmail(inputUserValues.email);
  await validatePasswordRequirements(inputUserValues.password);
  await hashPasswordInObject(inputUserValues);

  const newUser = await runInserQuery(inputUserValues);

  return newUser;

  async function validateNullableValues({ username, email, password }) {
    if (!username) {
      throw new ValidationError({
        message: "O nome de usuário não pode ser nulo.",
        action: "Informe um nome de usuário para realizar o cadastro.",
      });
    }

    if (!email) {
      throw new ValidationError({
        message: "O email não pode ser nulo.",
        action: "Informe um email para realizar o cadastro.",
      });
    }

    if (!password) {
      throw new ValidationError({
        message: "A senha não pode ser nula.",
        action: "Informe uma senha para realizar o cadastro.",
      });
    }
  }

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

  // why password requirements? https://pt.stackoverflow.com/a/216650
  async function validatePasswordRequirements(password) {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!regex.test(password)) {
      throw new ValidationError({
        message: "A senha informado não atende os requisitos mínimos.",
        action:
          "Informe uma senha que contenha: letras minúscula, letras maiúscula, número, caractere especial(@$!%*?&) e no mínimo 6 caracteres.",
      });
    }
  }

  async function hashPasswordInObject(inputUserValues) {
    const hashedPassword = await password.hash(inputUserValues.password);
    inputUserValues.password = hashedPassword;
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
  findOneByUsername,
};

export default user;
