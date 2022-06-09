import BaseUsecase from './BaseUsecase.mjs';
import FileProcessor from '../processors/FileProcessor.mjs';

export default class FileUsecase extends BaseUsecase {
  builder = FileProcessor;

  constructor(scope) {
    super(scope);
  }
}
