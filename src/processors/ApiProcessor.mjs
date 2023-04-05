import BaseProcessor from './BaseProcessor.mjs';

export default class ApiProcessor extends BaseProcessor {
  async buildResponse(req, res, result) {
    res.setHeader('Content-Type', 'application/json');

    if (result) {
      res.status(200).send(result);
    } else {
      res.status(204).end();
    }
  }
}
