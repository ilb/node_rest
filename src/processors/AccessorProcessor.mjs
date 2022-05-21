import BaseProcessor from './BaseProcessor.mjs';

export default class AccessorProcessor extends BaseProcessor {
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
