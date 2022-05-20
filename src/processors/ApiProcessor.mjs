import BaseProcessor from './BaseProcessor.mjs';

export default class ApiProcessor extends BaseProcessor {
  async initialize(req, res, next) {
    this.res = res;
    this.context = { query: { ...req.query, ...req.body }, req };
    this.scope = await this.createScope(this.context.req, next);
  }

  async process(usecaseInstance) {
    const usecase = new usecaseInstance(this.scope.cradle);

    return this.execute(usecase);
  }

  async buildResponse(result) {
    this.res.setHeader('Content-Type', 'application/json');

    if (result) {
      this.res.status(200).send(result);
    } else {
      this.res.status(204).end();
    }
  }
}
