import BaseUsecase from './BaseUsecase.mjs';
import ApiProcessor from '../processors/ApiProcessor.mjs';

export default class ApiUsecase extends BaseUsecase {
  builder = ApiProcessor;
}
