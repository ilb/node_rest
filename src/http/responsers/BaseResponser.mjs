import { notify } from '@ilb/mailer/src/errormailer.js';

export default class BaseResponser {
  constructor(res, req) {
    this.res = res;
    this.req = req;
  }

  buildSuccess(result) {}

  buildError(error) {
    if (error.type === 'FORBIDDEN') {
      return this.forbidden();
    }

    const errName = error.constructor.name;

    if (!['INVALID', 'INFO'].includes(error.type)) {
      console.trace(error);
      notify(error).catch(console.log);
    }

    if (['ValidationError', 'StatusError', 'InfoError'].includes(errName)) {
      return this.badRequest(error);
    } else {
      return this.internalError();
    }
  }

  emptyResponse() {
    this.res.status(204).end();
  }

  forbidden() {
    this.buildErrorResponse(403, { error: { description: 'Отказано в доступе' } });
  }

  badRequest(error) {
    this.buildErrorResponse(400, { error: { type: error.message, description: error.description } });
  }

  internalError(message = 'Ошибка на сервере') {
    this.buildErrorResponse(500, { error: { type: message } });
  }

  buildErrorResponse(httpCode, data) {
    this.res.setHeader('Content-Type', 'application/json');
    this.res.status(httpCode).send(data);
  }
}
