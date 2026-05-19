import type { MessageInstance } from 'antd/es/message/interface';

let _message: MessageInstance | null = null;

export function setMessageApi(api: MessageInstance) {
  _message = api;
}

export function getMessage(): MessageInstance | null {
  return _message;
}
