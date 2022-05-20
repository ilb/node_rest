import nc from 'next-connect';
import { onError, onNoMatch } from '../middlewares/errors.js';

class Router {
  constructor(params, createScope) {
    this.createScope = createScope;
    this.params = params;
    this.usecases = {};
  }

  get(usecase) {
    this.usecases.get = usecase;

    return this;
  }

  post(usecase) {
    this.usecases.post = usecase;

    return this;
  }

  put(usecase) {
    this.usecases.put = usecase;

    return this;
  }

  delete(usecase) {
    this.usecases.delete = usecase;

    return this;
  }

  build() {
    const nextConnect = nc(this.params);

    for (const method in this.usecases) {
      const usecase = this.usecases[method];
      const builder = new usecase.builder(this.createScope);
      const callback = (req, res, next) => builder.build(req, res, next, usecase)

      nextConnect[method](callback);
    }

    return nextConnect;
  }
}

export default (createScope) => {
  return new Router({ onNoMatch, onError }, createScope);
}
