/**
 * Express-like middleware for handling errors.
 * @param err error object
 * @param req request
 * @param res response
 */
export const onError = (err, req, res) => {
  const status = err.status || 500;
  const type = err.type || 'UNHANDLED_ERROR';
  const description = err.description || 'Something went wrong';
  console.error(err);

  if (!res.finished) {
    res.status(status).json({ error: { type: type, description: description } });
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
