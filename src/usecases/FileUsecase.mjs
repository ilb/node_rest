import BaseUsecase from './BaseUsecase.mjs';
import FileProcessor from '../processors/FileProcessor.mjs';

export default class FileUsecase extends BaseUsecase {
  static builder = FileProcessor;

  constructor(scope) {
    super(scope);
  }
}
