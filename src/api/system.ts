import client from './client';

// 用户管理
export function listUser(params: any) {
  return client.get('/system/user/list', { params });
}

export function getUser(userId: number) {
  return client.get(`/system/user/${userId}`);
}

export function addUser(data: any) {
  return client.post('/system/user', data);
}

export function updateUser(data: any) {
  return client.put('/system/user', data);
}

export function delUser(userIds: string) {
  return client.delete(`/system/user/${userIds}`);
}

export function resetUserPwd(userId: number, password: string) {
  return client.put('/system/user/resetPwd', { userId, password });
}

// 角色管理
export function listRole(params: any) {
  return client.get('/system/role/list', { params });
}

export function getRole(roleId: number) {
  return client.get(`/system/role/${roleId}`);
}

export function addRole(data: any) {
  return client.post('/system/role', data);
}

export function updateRole(data: any) {
  return client.put('/system/role', data);
}

export function delRole(roleIds: string) {
  return client.delete(`/system/role/${roleIds}`);
}
