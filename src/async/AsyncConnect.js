import nc from 'next-connect';
import Response from './Response.js';

const AsyncConnect = ({ path, taskManager, task, onError } = {}) => {
  if (!path) throw new Error('API path should be defined');
  if (!taskManager) throw new Error('Task manager should be defined');
  if (!task) throw new Error('Task function should be defined');

  let basePath = '';
  let apiPath = path;
  if (!path.startsWith('/api')) {
    basePath = path.split('/api').shift();
    apiPath = path.slice(path.indexOf('/api'));
  }

  /**
   * Add new task to the queue
   * @param {*} req
   * @param {*} res
   */
  const addTask = async (req, res) => {
    const context = req.body;
    const uuid = taskManager.addTask(task, { context });
    res.redirect(303, `${basePath}${apiPath}/${uuid}`);
  };

  /**
   * Try to get task result
   * @param {*} req
   * @param {*} res
   */
  const getTask = async (req, res) => {
    const { uuid } = req.params;
    if (!taskManager.exists(uuid)) {
      res.status(404).send();
      return;
    }

    if (taskManager.isDone(uuid)) {
      const response = await taskManager.getResult(uuid);

      if (response instanceof Error) {
        throw response;
      }

      if (response instanceof Response) {
        for (const [header, value] of response.headers.entries()) {
          res.setHeader(header, value);
        }
        res.status(200).send(response.content);
        return;
      }

      res.status(200).json(response);
    } else {
      res.setHeader('Refresh', `3;${basePath}${apiPath}/${uuid}`);
      res.status(202).end();
    }
  };

  const nextApiHandler = nc().use(
    apiPath,
    nc({ attachParams: true, onError }).post(addTask).get(`/:uuid`, getTask)
  );

  /**
   * Util method to incapsulate request call for adding new task
   * @param {Object} context task context
   */
  nextApiHandler.addTask = (context) => {
    const uuid = taskManager.addTask(task, { context });
    return (res) => res.redirect(303, `${basePath}${apiPath}/${uuid}`);
  };

  return nextApiHandler;
};

export default AsyncConnect;
