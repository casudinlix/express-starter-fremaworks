export interface IUser {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  is_active: boolean;
  email_verified: boolean;
  email_verified_at?: Date;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface IUserCreate {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface IUserUpdate {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  is_active?: boolean;
  email_verified?: boolean;
}

export interface IUserWithRoles extends Omit<IUser, 'password'> {
  roles: string[];
  permissions: string[];
}
