import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError,
} from "infra/errors";

function onNoMatchHandler(_, response) {
  const publucErrorObject = new MethodNotAllowedError();
  console.error(publucErrorObject);
  response.status(publucErrorObject.statusCode).json(publucErrorObject);
}

function onErrorHandler(error, _, response) {
  if (error instanceof ValidationError || error instanceof NotFoundError) {
    return response.status(error.statusCode).json(error);
  }

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
