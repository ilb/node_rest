export default class Response {
  constructor({ status = 200, content, headers }) {
    this.status = status;
    this.content = content;
    this.headers = new Map(Object.entries(headers));
  }
}
