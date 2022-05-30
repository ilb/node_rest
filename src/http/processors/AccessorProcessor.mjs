import BaseProcessor from './BaseProcessor.mjs';
import AccessorResponser from '../responsers/AccessorResponser.mjs';

export default class AccessorProcessor extends BaseProcessor {
  responser = AccessorResponser;

  async initialize(usecase) {
    await super.initialize(usecase);

    this.responserInstance.baseUrl = usecase.baseUrl;
    this.responserInstance.refreshTime = usecase.refreshTime;
  }
}
