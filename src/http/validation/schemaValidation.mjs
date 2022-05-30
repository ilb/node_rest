import ajv from './ajv.mjs';
import { CriticalError } from '../../errors/Errors.mjs';

export function stringifyAjvErrors(ajvErrors) {
  const errorMessages = [];

  for (const err of ajvErrors) {
    const errProperty = (function () {
      const endpoints = err.dataPath.split('/');
      return endpoints[endpoints.length - 1];
    })();

    switch (err.keyword) {
      case 'required':
        errorMessages.push(`В запросе отсутствует ${err.params.missingProperty}`);
        break;
      case 'type':
        errorMessages.push(`Тип ${errProperty} должен быть ${err.params.type}`);
        break;
      case 'format':
        errorMessages.push(`Поле ${errProperty} должно иметь формат ${err.params.format}`);
        break;
      case 'maxLength':
        errorMessages.push(
          `Поле ${errProperty} должно быть не длиннее ${err.params.limit} символов`
        );
        break;
      case 'isNotEmpty':
        errorMessages.push(err.message);
        break;
      default:
        errorMessages.push(
          `Ошибка при валидации данных. Поле ${errProperty}. Ошибка: ${JSON.stringify(err)}`
        );
    }
  }

  return errorMessages;
}

export function validateBySchema(object, schema) {
  const validate = ajv.compile(schema);
  if (!validate(object)) {
    const errorMessages = stringifyAjvErrors(validate.errors);
    let generalError = errorMessages.reduce((acc, msg) => (acc += `${msg}\n`), '');
    generalError = generalError.substring(0, generalError.length - 1);
    throw new CriticalError(generalError, 'VALIDATION_ERROR', 400);
  }
}
// refactor