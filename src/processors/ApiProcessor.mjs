import BaseProcessor from './BaseProcessor.mjs';

export default class ApiProcessor extends BaseProcessor {
  async buildResponse(result) {
    this.res.setHeader('Content-Type', 'application/json');

    if (result) {
      this.res.status(200).send(result);
    } else {
      this.res.status(204).end();
    }
  }
}
