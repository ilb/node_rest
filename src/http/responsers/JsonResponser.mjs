import BaseResponser from './BaseResponser.mjs';

export default class JsonResponser extends BaseResponser {
  buildSuccess() {
    if (!this.result) {
      return this.emptyResponse();
    }

    this.res.setHeader('Content-Type', 'application/json');
    this.res.status(200).send(this.result);
  }
}
