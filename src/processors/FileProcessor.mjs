import BaseProcessor from './BaseProcessor.mjs';

export default class FileProcessor extends BaseProcessor {
  async buildResponse(req, res, result) {
    const { file, contentType, filename } = result;

    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Length', file.length);
    res.setHeader('Content-Type', contentType);
    res.write(file, 'binary');
    res.end();
  }
}
