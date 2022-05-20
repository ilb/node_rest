import BaseProcessor from './BaseProcessor.mjs';

export default class FileProcessor extends BaseProcessor {
  async initialize(req, res, next) {
    this.res = res;
    this.context = { query: { ...req.query, ...req.body }, req };
    this.scope = await this.createScope(this.context.req, true, null, next);
  }

  async process(usecaseInstance) {
    const usecase = new usecaseInstance(this.scope.cradle);

    return this.execute(usecase);
  }

  async buildResponse(result) {
    const { file, contentType, filename } = result;

    this.res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    this.res.setHeader('Content-Length', file.length);
    this.res.setHeader('Content-Type', contentType);
    this.res.write(file, 'binary');
    this.res.end();
  }
}
