export class RestError extends Error {
  constructor(type, description, status) {
    super(type);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RestError)
    }

    this.type = type;
    this.status = status;
    this.message = description;
    this.description = description;
  }
}

export class CriticalError extends RestError {}

export class NotificationError extends RestError {}

export default class Errors {
  static forbidden(description = 'Доступ запрещен!', type = 'FORBIDDEN') {
    return new CriticalError(type, description, 403);
  }
}
