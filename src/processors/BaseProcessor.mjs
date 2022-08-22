import { notify } from '@ilb/mailer/src/errormailer.js';

export default class BaseProcessor {
  res;

  constructor(createScope) {
    this.createScope = createScope;
    this.context = { query: {} };
  }

  async initialize(req, res, next) {
    this.req = req;
    this.res = res;
    this.context = { query: { ...req.query, ...req.body, ...req.params }, req };
    this.scope = await this.createScope(this.context.req, next);
  }


  async build(req, res, next, usecaseInstance) {
    try {
      await this.initialize(req, res, next);
      const result = await this.process(usecaseInstance);

      if (this.res.finished) {
        console.log('Response already sent');
        return;
      }

      await this.buildResponse(result);
    } catch (err) {
      console.log(err);
      if (err.type === 'FORBIDDEN') {
        return this.forbidden();
      }

      const errName = err.constructor.name;

      if (!['INVALID', 'INFO'].includes(err.type)) {
        console.trace(err);
        notify(this.buildError(err)).catch(console.log);
      }

      if (['ValidationError', 'BadRequestError', 'StatusError', 'UserValidationError', 'InfoError'].includes(errName)) {
        return this.badRequest(err);
      } else {
        return this.internalError();
      }
    }
  }

  async process(usecase) {
    const instance = new usecase(this.scope.cradle);

    instance.initialize && await instance.initialize(this.context.query);
    instance.checkAccess && await instance.checkAccess();
    instance.validate && await instance.validate(this.context.query);

    return instance.process(this.context.query);
  }

  buildError(err) {
    return {
      message: err.message,
      stack: err.stack,
      addMessage: JSON.stringify({
        ...err.addMassage,
        context: this.context.query,
        session: this.scope.cradle.session,
        info: {
          route: this.req.url,
          method: this.req.method
        }
      }, null, 2)
    }
  }

  async buildResponse() {

  }

  async forbidden() {
    return this.buildErrorResponse(403, { error: { description: 'Отказано в доступе' } });
  }

  async badRequest(error) {
    return this.buildErrorResponse(400, { error: { type: error.message, description: error.description } });
  }

  async internalError(message = 'Ошибка на сервере') {
    this.buildErrorResponse(500, { error: { type: message } });
  }

  buildErrorResponse(httpCode, data) {
    this.res.setHeader('Content-Type', 'application/json');
    this.res.status(httpCode).send(data);
  }
}
