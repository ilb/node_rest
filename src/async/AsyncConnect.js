import nc from 'next-connect';
import Response from './Response.js';

const AsyncConnect = ({ path, taskManager, task, onError, onNotFound } = {}) => {
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
    res.writeHead(303, { Location: `${basePath}${apiPath}/${uuid}?i=0` }).end();
  };

  /**
   * Try to get task result
   * @param {*} req
   * @param {*} res
   */
  const getTask = async (req, res) => {
    const { uuid } = req.params;
    const iteration = req.params.i || +req.url.split('i=').pop();
    if (!taskManager.exists(uuid)) {
      if (onNotFound) onNotFound(req, res);
      else res.writeHead(404).end();
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
        res.writeHead(200).end(response.content);
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(response));
    } else {
      res.setHeader('Refresh', `3;${basePath}${apiPath}/${uuid}?i=${iteration + 1}`);
      res.writeHead(202).end(`Waiting iteration: ${iteration}`);
    }
  };

  const nextApiHandler = nc({ onError }).use(
    apiPath,
    nc({ attachParams: true, onError }).post(addTask).get(`/:uuid`, getTask)
  );

  /**
   * Util method to incapsulate request call for adding new task
   * @param {Object} context task context
   */
  nextApiHandler.addTask = (context) => {
    const uuid = taskManager.addTask(task, { context });
    return [
      uuid,
      (res) => res.writeHead(303, { Location: `${basePath}${apiPath}/${uuid}?i=0` }).end()
    ];
  };

  return nextApiHandler;
};

export default AsyncConnect;
