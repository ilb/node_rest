import BaseProcessor from './BaseProcessor.mjs';

export default class AccessorProcessor extends BaseProcessor {
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
    const accessorUrl = process.env.BASE_URL + this.context.req.url;

    if (result) {
      this.res.status(200).json(result);
    } else {
      this.res.setHeader('Refresh', '3; ' + accessorUrl);
      this.res.status(202).end();
    }
  }
}
