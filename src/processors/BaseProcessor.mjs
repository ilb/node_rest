import { notify } from '@ilb/mailer/src/errormailer.js';

export default class BaseProcessor {
  res;

  constructor(createScope) {
    this.createScope = createScope;
    this.context = { query: {} };
  }

  async build(req, res, next, usecaseInstance) {
    try {
      await this.initialize(req, res, next);
      const result = await this.process(usecaseInstance);
      await this.buildResponse(result);
    } catch (err) {
      console.log(err);
      if (err.type === 'FORBIDDEN') {
        return this.forbidden();
      }

      const errName = err.constructor.name;

      if (!['INVALID', 'INFO'].includes(err.type)) {
        console.trace(err);
        notify(err).catch(console.log);
      }

      if (['ValidationError', 'BadRequestError', 'StatusError', 'UserValidationError', 'InfoError'].includes(errName)) {
        return this.badRequest(err);
      } else {
        return this.internalError();
      }
    }

  }

  async execute(usecase) {
    usecase.initialize && await usecase.initialize(this.context.query);
    usecase.checkAccess && await usecase.checkAccess();
    usecase.validate && await usecase.validate(this.context.query);

    return await usecase.process(this.context.query);

  }

  async initialize(req, res, next) {

  }

  async process(usecaseInstance) {

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
