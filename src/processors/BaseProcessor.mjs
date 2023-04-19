export default class BaseProcessor {
  constructor(createScope) {
    this.createScope = createScope;
    this.context = { query: {} };
  }

  async initialize(req, res, next) {
    this.context = { query: { ...req.query, ...req.body, ...req.params }, req };
    this.scope = await this.createScope(this.context.req, next);
    req.context = this.context;
    req.scope = this.scope;
  }

  async build(req, res, next, usecaseInstance) {
    await this.initialize(req, res, next);
    const result = await this.process(usecaseInstance);

    if (res.finished) {
      console.log('Response already sent');
      return;
    }

    await this.buildResponse(req, res, result);
  }

  async process(usecase) {
    const instance = new usecase(this.scope.cradle);

    instance.initialize && (await instance.initialize(this.context.query));
    instance.checkAccess && (await instance.checkAccess());
    instance.validate && (await instance.validate(this.context.query));

    return instance.process(this.context.query);
  }

  async buildResponse() {}
}
