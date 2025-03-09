import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const inputUserValues = request.body;
  const newUser = await user.create(inputUserValues);
  return response.status(201).json(newUser);
}
