export default class TaskManager {
  async saveTask() {
    throw new Error(this.constructor.name + '.saveTask not implemented');
  }
  async findTask() {
    throw new Error(this.constructor.name + '.findTask not implemented');
  }
}
