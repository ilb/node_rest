import BaseResponser from './BaseResponser.mjs';

export default class AccessorResponser extends BaseResponser {
  buildSuccess() {
    if (!this.result) {
      this.res.setHeader('Refresh', `${this.refreshTime}; ` + this.baseUrl + this.req.url);
      this.res.status(202).end();
    }

    this.res.status(200).json(this.result);
  }
}
