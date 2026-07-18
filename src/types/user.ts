export interface User {
  id: string;
  phone?: string;
  wechatOpenId?: string;
  wechatUsername?: string;
  accountName: string;
  nickname: string;
  passwordHash?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPublic {
  id: string;
  accountName: string;
  nickname: string;
  avatarUrl?: string;
  phone?: string;
  wechatUsername?: string;
}

export interface UsersData {
  users: User[];
}
