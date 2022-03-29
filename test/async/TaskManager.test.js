import delay from 'delay';
import { v4 as uuidv4 } from 'uuid';

import QueueTaskManager from '../../src/async/QueueTaskManager';

test('addTask', async () => {
  async function handler() {
    console.log('starting test task');

    await delay(1000);
    return { value: 100 };
  }
  const tm = new QueueTaskManager({});
  const uid = uuidv4();

  tm.addTask({ uid, handler });
  expect(tm.queue.pending).toStrictEqual(1);

  let i = 0;
  while (!tm.isDone(uid) && i < 3) {
    console.log(`waiting for task ${uid}`);
    await delay(500);
    i++;
  }
  const result = await tm.getResult(uid);
  const expected = { value: 100 };
  expect(result).toStrictEqual(expected);
});
