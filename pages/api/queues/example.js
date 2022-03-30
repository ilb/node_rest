import AsyncConnect from '../../../src/async/AsyncConnect';
import ExampleUsecase from '../../../src/example/ExampleUsecase';

export default AsyncConnect({ path: '/api/queues/example', handler: ExampleUsecase.process });
