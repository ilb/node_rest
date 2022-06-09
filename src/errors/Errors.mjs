export class StatusError extends Error {
  constructor(type, description, status) {
    super(`${type}: ${description}`);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StatusError)
    }

    this.type = type;
    this.status = status;
    this.description = description;
  }
}

export class InfoError extends Error {
  constructor(type, description, status) {
    super(type);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InfoError)
    }

    this.type = type;
    this.status = status;
    this.description = description;
  }
}

export default class Errors {
  static critical(description) {
    return new StatusError('CRITICAL', description, 500);
  }

  static forbidden(description = 'Доступ запрещен!', type = 'FORBIDDEN') {
    return new StatusError(type, description, 403);
  }

  static notFound(description, type = 'NOT_FOUND') {
    return new StatusError(type, description, 404);
  }

  static timeout(description, type = 'TIMEOUT') {
    return new StatusError(type, description, 504);
  }

  static invalid(description) {
    return new StatusError('INVALID', description, 400);
  }

  static info(info, type) {
    return new InfoError('INFO', { info, type }, 412);
  }
}

class CustomError extends Error {
  constructor(message, name, addMessage = '') {
    super(name);
    this.name = name;
    this.message = message;
    this.description = message;
    this.addMessage = addMessage;
  }
}

export class ValidationError extends CustomError {
  constructor(message, addMessage) {
    super(message, 'ValidationError', addMessage);
  }
}