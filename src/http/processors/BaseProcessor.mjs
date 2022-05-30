import JsonResponser from '../responsers/JsonResponser.mjs';

export default class BaseProcessor {
  responser = JsonResponser;

  constructor(createScope, req, res, next) {
    this.createScope = createScope;
    this.res = res;
    this.req = req;
    this.next = next;
    this.context = { ...req.query, ...req.body, ...req.params, req };
    this.responserInstance = new this.responser(res, req);
  }

  async initialize(usecase) {
    const scope = await this.createScope(this.context.req, this.next);
    this.usecase = new usecase(scope.cradle);
  }

  async build(req, res, next, usecase) {
    try {
      await this.initialize(usecase);
      const result = await this.process();

      this.responserInstance.buildSuccess(result);
    } catch (err) {
      console.log(err);
      this.responserInstance.buildError(err);
    }
  }

  async process() {
    this.usecase.initialize && await this.usecase.initialize(this.context);
    this.usecase.checkAccess && await this.usecase.checkAccess();
    this.usecase.validate && await this.usecase.validate(this.context);

    return await this.usecase.process(this.context);
  }
}
