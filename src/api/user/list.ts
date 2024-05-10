import { http } from '@/utils/http/axios';

//获取table
export function getUserInfos(params) {
  console.log('params', params);
  return http.request({
    url: '/user/search',
    method: 'get',
    params,
  });
}
