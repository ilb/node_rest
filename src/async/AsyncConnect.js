import nc from 'next-connect';
import { v4 as uuidv4 } from 'uuid';

const AsyncConnect = ({ adapter, flows }) => {
  const createTask = async (req, res) => {
    const uuid = uuidv4();
    // await saveTask({ uuid, flow, states: [current] });

    res.status(200).json({});
  };

  const getTask = async (req, res) => {
    const { uuid } = req.params;

    // const { flow, states } = await findTask(uuid);

    res.status(200).json({});
  };

  return nc({ attachParams: true }).post('/', createTask).get('/:uuid', getTask);
};

export default AsyncConnect;
