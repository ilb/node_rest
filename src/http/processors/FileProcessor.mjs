import BaseProcessor from './BaseProcessor.mjs';
import FileResponser from '../responsers/FileResponser.mjs';

export default class FileProcessor extends BaseProcessor {
  responser = FileResponser;
}
