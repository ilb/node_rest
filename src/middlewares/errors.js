import { notify } from '@ilb/mailer/src/errormailer.js';

/**
 * Express-like middleware for handling errors.
 * @param err error object
 * @param req request
 * @param res response
 */
export const onError = (err, req, res) => {
  const status = err.status || 500;
  const type = err.type || 'UNHANDLED_ERROR';
  const description = err.description || 'Необработанная ошибка сервера';

  if (!res.finished) {
    res.status(status).json({ error: { type: type, description: description } });
  }

  if (!['INVALID', 'INFO'].includes(type)) {
    let data = req.body;
    if (req.scope.cradle.encryption) {
      data = req.scope.cradle.encryption.cipher(data);
    }
    notify({
      message: err.message,
      stack: err.stack,
      addMessage: JSON.stringify(
        {
          ...err.addMassage,
          context: data,
          session: req.scope.cradle.session,
          info: {
            route: req.url,
            method: req.method
          }
        },
        null,
        2
      )
    }).catch(console.log);
  } else {
    notify(err).catch(console.log);
  }
};

/**
 * Express-like middleware for handling wrong HTTP methods.
 * @param req request
 * @param res response
 */
export const onNoMatch = (req, res) => {
  res.status(405).end();
};

export const errors = () => ({ onError, onNoMatch });
