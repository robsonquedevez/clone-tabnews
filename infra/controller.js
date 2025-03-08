import { InternalServerError, MethodNotAllowedError } from "infra/errors";

function onNoMatchHandler(_, response) {
  const publucErrorObject = new MethodNotAllowedError();
  console.error(publucErrorObject);
  response.status(publucErrorObject.statusCode).json(publucErrorObject);
}

function onErrorHandler(error, _, response) {
  const publucErrorObject = new InternalServerError({
    cause: error,
    statusCode: error.statusCode,
  });
  console.error(publucErrorObject);
  response.status(publucErrorObject.statusCode).json(publucErrorObject);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
