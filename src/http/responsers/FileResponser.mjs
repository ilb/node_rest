import BaseResponser from './BaseResponser.mjs';

export default class FileResponser extends BaseResponser {
  buildSuccess() {
    const { file, contentType, filename } = this.result;

    this.res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    this.res.setHeader('Content-Length', file.length);
    this.res.setHeader('Content-Type', contentType);
    this.res.write(file, 'binary');
    this.res.end();
  }
}
