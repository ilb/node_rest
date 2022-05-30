import nc from 'next-connect';
import { onError, onNoMatch } from './middlewares/errors.js';
import ApiProcessor from './processors/ApiProcessor.mjs';

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
    this.addHandler(pathOrUsecase, usecase, 'get')

    return this;
  }

  post(pathOrUsecase, usecase) {
    this.addHandler(pathOrUsecase, usecase, 'post')

    return this;
  }

  put(pathOrUsecase, usecase) {
    this.addHandler(pathOrUsecase, usecase, 'put')

    return this;
  }

  delete(pathOrUsecase, usecase) {
    this.addHandler(pathOrUsecase, usecase, 'delete')

    return this;
  }

  buildCallback(usecase) {
    return (req, res, next) => {
      const builderClass = usecase.builder ? usecase.builder : ApiProcessor;
      const builder = new builderClass(this.createScope, req, res, next);

      return builder.build(usecase)
    }
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
      this.nextConnect[method](this.prefix + pathOrUsecase, this.buildCallback(usecase))
    } else {
      this.nextConnect[method](this.buildCallback(pathOrUsecase))
    }
  }

  isPath(usecaseOrPath) {
    return typeof usecaseOrPath === 'string';
  }
}

export default (createScope) => {
  return new Router({ attachParams: true, onNoMatch, onError }, createScope);
}
