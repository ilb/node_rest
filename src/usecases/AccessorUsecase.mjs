import BaseUsecase from './BaseUsecase.mjs';
import AccessorProcessor from '../processors/AccessorProcessor.mjs';

export default class AccessorUsecase extends BaseUsecase {
  static builder = AccessorProcessor;

  constructor(scope) {
    super(scope);
  }
}
