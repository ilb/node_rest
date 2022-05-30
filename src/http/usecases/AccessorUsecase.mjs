import BaseUsecase from './BaseUsecase.mjs';
import AccessorProcessor from '../processors/AccessorProcessor.mjs';

export default class AccessorUsecase extends BaseUsecase {
  builder = AccessorProcessor;
  baseUrl = process.env.BASE_URL;
  refreshTime = 3;
}
