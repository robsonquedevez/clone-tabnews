import user from "models/user";
import password from "models/password";
import { NotFoundError, UnauthorizedError } from "infra/errors";

async function getAuthenticatedUser(providerEmail, providerPassword) {
  try {
    const storedUser = await findUserByEmail(providerEmail);
    await validatePassword(providerPassword, storedUser.password);
    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
      });
    }
    throw error;
  }

  async function findUserByEmail(providerEmail) {
    try {
      return await user.findOneByEmail(providerEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Dados de autenticação não conferem.",
          action: "Verifique se os dados enviados estão corretos.",
        });
      }
      throw error;
    }
  }

  async function validatePassword(providerPassword, storedPassword) {
    const correctPasswordMatch = await password.compare(
      providerPassword,
      storedPassword,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
