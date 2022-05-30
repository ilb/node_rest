import Ajv from 'ajv';
import { checkInn } from './rules.js';

const ajv = new Ajv({ allErrors: true });

ajv.addKeyword('options');

ajv.addFormat(
  'email',
  /(^[a-z\d.!#$%&'*+/=?^_`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*$)|(^$)/
);

ajv.addKeyword('isNotEmpty', {
  type: 'string',
  errors: true,
  validate: function validate(schema, data, parent, key) {
    validate.errors = [
      {
        keyword: 'isNotEmpty',
        message: 'должно иметь обязательное поле ' + key,
        params: { keyword: 'isNotEmpty' }
      }
    ];

    return typeof data === 'string' && data.trim() !== '';
  }
});

ajv.addKeyword('inn', {
  type: 'string',
  errors: true,
  validate: function validate(length, data) {
    validate.errors = [
      {
        keyword: 'inn',
        message: 'ИНН введен некорректно',
        params: { keyword: 'inn' }
      }
    ];

    return !data || checkInn(data);
  }
});

export default ajv;

// refactor ?