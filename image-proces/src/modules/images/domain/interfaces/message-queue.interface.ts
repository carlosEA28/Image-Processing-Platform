export const MESSAGE_QUEUE = Symbol('MESSAGE_QUEUE');

export interface MessageQueue {
  ensureQueue(queueName: string): Promise<string>;
  send<T>(queueUrl: string, message: T): Promise<void>;
}
