import Example from '../queues/example';

export default async (req, res) => {
  // some other work
  const { redirectTo } = await Example.addTask({ contextValue: 'test' });
  res.redirect(303, redirectTo);
};
