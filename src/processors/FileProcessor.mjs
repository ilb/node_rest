import BaseProcessor from './BaseProcessor.mjs';

export default class FileProcessor extends BaseProcessor {
  async buildResponse(result) {
    const { file, contentType, filename } = result;

    this.res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    this.res.setHeader('Content-Length', file.length);
    this.res.setHeader('Content-Type', contentType);
    this.res.write(file, 'binary');
    this.res.end();
  }
}
