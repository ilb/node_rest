import BaseProcessor from './BaseProcessor.mjs';

export default class AccessorProcessor extends BaseProcessor {
  async buildResponse(req, res, result) {
    const accessorUrl = process.env.BASE_URL + this.context.req.url;

    if (res.finished) {
      console.log(res.statusCode);
      console.log(res.getHeaders());
    }

    if (result) {
      res.status(200).json(result);
    } else {
      res.setHeader('Refresh', '3; ' + accessorUrl);
      res.status(202).end();
    }
  }
}
