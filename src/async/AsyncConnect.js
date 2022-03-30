import nc from 'next-connect';
import fetch from 'isomorphic-fetch';

const AsyncConnect = ({ path, adapter, handler }) => {
  if (!path) throw new Error('API path should be defined');
  if (!handler) throw new Error('Task handler should be defined')

  /**
   * Add new task to the queue
   * @param {*} req 
   * @param {*} res
   */
  const addTask = async (req, res) => {
    const uuid = taskManager.addTask({ handler })
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
      const data = await taskManager.getResult(uuid)
      res.status(200).json({ status: 200, data, errors: []})
    } else {
      res.setHeader('Refresh', `3;${path}/${uuid}`)
      res.status(202).json({ status: 202, data: {}, errors: []})
    }
  };

  const nextApiHandler = nc({ attachParams: true }).post('/', addTask).get('/:uuid', getTask);
  
  /**
   * Util method to incapsulate request call for adding new task
   * @param {Object} context task context
   */
  nextApiHandler.addTask = async (context) => {
    const response = await fetch(`${path}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(context),
      redirect: 'follow'
    })
    const [_, redirectTo] = response.getHeader('Refresh').split(';');
    return { redirectTo };
  }
};

export default AsyncConnect;
