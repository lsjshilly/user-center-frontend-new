import { defineStore } from 'pinia';
import { store } from '@/store';
import { ACCESS_TOKEN, CURRENT_USER, IS_SCREENLOCKED } from '@/store/mutation-types';
import { ResultEnum } from '@/enums/httpEnum';

import {
  getUserInfo as getUserInfoApi,
  getPermissions as getPermissionsApi,
  login,
  register,
} from '@/api/system/user';
import { storage } from '@/utils/Storage';

export type UserInfoType = {
  // TODO: add your own data
  userId: number;
  username: string;
  nickname: string;
  avatar: string;
  gender: number;
  tags: string;
  city: string;
  description: string;
  birthday: Date;
  create_time: Date;
};

export interface IUserState {
  token: string;
  username: string;
  welcome: string;
  avatar: string;
  permissions: any[];
  info: UserInfoType;
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): IUserState => ({
    token: storage.get(ACCESS_TOKEN, ''),
    username: '',
    welcome: '',
    avatar: '',
    permissions: [],
    info: storage.get(CURRENT_USER, {}),
  }),
  getters: {
    getToken(): string {
      return this.token;
    },
    getAvatar(): string {
      return this.avatar;
    },
    getNickname(): string {
      return this.username;
    },
    getPermissions(): [any][] {
      return this.permissions;
    },
    getUserInfo(): UserInfoType {
      return this.info;
    },
  },
  actions: {
    setToken(token: string) {
      this.token = token;
    },
    setAvatar(avatar: string) {
      this.avatar = avatar;
    },
    setPermissions(permissions) {
      this.permissions = permissions;
    },
    setUserInfo(info: UserInfoType) {
      this.info = info;
    },
    // 登录
    async login(params: any) {
      const response = await login(params);
      const { data, code } = response;
      if (code === ResultEnum.SUCCESS) {
        const ex = 7 * 24 * 60 * 60;
        storage.set(ACCESS_TOKEN, data, ex);
        storage.set(IS_SCREENLOCKED, false);
        this.setToken(data);
      }
      return response;
    },

    // 获取用户权限信息
    async getUserPermissions() {
      const result = await getPermissionsApi();
      if (result.permissions && result.permissions.length) {
        console.log(result.permissions);
        const permissionsList = JSON.parse(result.permissions);
        this.setPermissions(permissionsList);
        result.permissions = permissionsList;
      } else {
        throw new Error('getInfo: permissionsList must be a non-null array !');
      }
      return result;
    },

    // 获取用户信息
    async getInfo() {
      const result = await getUserInfoApi();

      this.setUserInfo(result);
      const ex = 7 * 24 * 60 * 60;
      storage.set(CURRENT_USER, result, ex);
      this.setAvatar(result.avatar);
      return result;
    },

    // 登录
    async register(params: any) {
      const response = await register(params);

      return response;
    },

    // 登出
    async logout() {
      this.setPermissions([]);
      this.setUserInfo({
        username: '',
        userId: 0,
        nickname: '',
        avatar: '',
        gender: 0,
        tags: '',
        city: '',
        description: '',
        birthday: new Date(),
        create_time: new Date(),
      });
      storage.remove(ACCESS_TOKEN);
      storage.remove(CURRENT_USER);
    },
  },
});

// Need to be used outside the setup
export function useUser() {
  return useUserStore(store);
}
