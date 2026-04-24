import client from './client';

export function login(data: { username: string; password: string; code?: string; uuid?: string }) {
  return client.post('/login', data);
}

export function getInfo() {
  return client.get('/getInfo');
}

export function getRouters() {
  return client.get('/getRouters');
}

export function getCaptchaImage() {
  return client.get('/captchaImage');
}
