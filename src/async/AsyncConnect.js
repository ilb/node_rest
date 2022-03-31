import nc from 'next-connect';

const AsyncConnect = ({ path, adapter, handler }) => {
  if (!path) throw new Error('API path should be defined');
  if (!handler) throw new Error('Task handler should be defined');

  /**
   * Add new task to the queue
   * @param {*} req
   * @param {*} res
   */
  const addTask = async (req, res) => {
    const uuid = taskManager.addTask({ handler });
    res.redirect(303, `${path}/${uuid}`);
  };

  /**
   * Try to get task result
   * @param {*} req
   * @param {*} res
   */
  const getTask = async (req, res) => {
    const { uuid } = req.params;
    if (taskManager.isDone(uuid)) {
      const response = await taskManager.getResult(uuid);

      if (response instanceof Error) {
        res.status(response.status).send(response.message);
      }

      if (response instanceof Response) {
        for (const [header, value] of response.headers.entries()) {
          res.setHeader(header, value);
        }
        res.status(200).send(response.content);
      }

      res.status(200).json({ data: response });
    } else {
      res.setHeader('Refresh', `3;${path}/${uuid}`);
      res.status(202).end();
    }
  };

  const nextApiHandler = nc({ attachParams: true }).post('/', addTask).get('/:uuid', getTask);

  /**
   * Util method to incapsulate request call for adding new task
   * @param {Object} context task context
   */
  nextApiHandler.addTask = async (context) => {
    const uuid = taskManager.addTask({ handler });
    return (res) => res.redirect(303, `${path}/${uuid}`);
  };
};

export default AsyncConnect;
