import nc from 'next-connect';
import { onError, onNoMatch } from '../middlewares/errors.js';

class Router {
  constructor(params, createScope) {
    this.createScope = createScope;
    this.nextConnect = nc(params);
    this.prefix = '';
  }

  use(...params) {
    this.nextConnect.use(...params);

    return this;
  }

  get(pathOrUsecase, usecase) {
    this.addHandler(pathOrUsecase, usecase, 'get');

    return this;
  }

  post(pathOrUsecase, usecase) {
    this.addHandler(pathOrUsecase, usecase, 'post');

    return this;
  }

  put(pathOrUsecase, usecase) {
    this.addHandler(pathOrUsecase, usecase, 'put');

    return this;
  }

  delete(pathOrUsecase, usecase) {
    this.addHandler(pathOrUsecase, usecase, 'delete');

    return this;
  }

  buildCallback(usecase) {
    const builder = new usecase.builder(this.createScope);

    return async (req, res, next) => await builder.build(req, res, next, usecase);
  }

  setPrefix(prefix) {
    this.prefix = prefix;

    return this;
  }

  build() {
    return this.nextConnect;
  }

  addHandler(pathOrUsecase, usecase, method) {
    if (this.isPath(pathOrUsecase)) {
      this.nextConnect[method](this.prefix + pathOrUsecase, this.buildCallback(usecase));
    } else {
      this.nextConnect[method](this.buildCallback(pathOrUsecase));
    }
  }

  isPath(usecaseOrPath) {
    return typeof usecaseOrPath === 'string';
  }
}

export default (createScope, match = onNoMatch, error = onError) => {
  return new Router({ attachParams: true, onNoMatch: match, onError: error }, createScope);
};
