import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export class ApiError extends Error {
  constructor(
    public statusCode = 400,
    message: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export const globalErrorHandler = (error: FastifyError, _: FastifyRequest, reply: FastifyReply) => {
  console.error(error);

  if (error.validation) {
    const validation = error.validation[0];
    return reply.status(400).send({
      message: validation.message,
      statusCode: 400,
    });
  }

  if (error.code === 'FST_ERR_CTP_INVALID_JSON_BODY') {
    return reply.status(400).send({
      message: 'malformed json body',
      statusCode: 400,
    });
  }

  if (error instanceof ApiError) {
    return reply
      .status(error.statusCode)
      .send({ message: error.message, statusCode: error.statusCode });
  }

  return reply.status(500).send({ message: 'internal server error', statusCode: 500 });
};
