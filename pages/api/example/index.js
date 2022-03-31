import Example from '../queues/example';

export default async (req, res) => {
  // some other work
  const executeResponse = await Example.addTask({ contextValue: 'test' });
  executeResponse(res);
};
