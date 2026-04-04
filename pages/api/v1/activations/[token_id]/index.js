import { createRouter } from "next-connect";
import controller from "infra/controller";
import activation from "models/activation";
import { NotFoundError } from "infra/errors";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activation_token"), patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const activationTokenId = request.query.token_id;

  const validActivationToken =
    await activation.findOneValidById(activationTokenId);

  if (!validActivationToken) {
    throw new NotFoundError({
      message:
        "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
      action: "Faça um novo cadastro.",
    });
  }

  await activation.activateUserByUserId(validActivationToken.user_id);

  const usedActivationToken =
    await activation.markTokenAsUsed(activationTokenId);

  return response.status(200).json(usedActivationToken);
}
