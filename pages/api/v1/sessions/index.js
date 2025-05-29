import { createRouter } from "next-connect";
import controller from "infra/controller";
import authentication from "models/authentication";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const inputUserValues = request.body;

  // eslint-disable-next-line no-unused-vars
  const authenticatedUser = await authentication.getAuthenticatedUser(
    inputUserValues.email,
    inputUserValues.password,
  );

  return response.status(201).json({});
}
