export interface IPermission {
  id: string;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IPermissionCreate {
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string;
}

export interface IPermissionUpdate {
  name?: string;
  slug?: string;
  resource?: string;
  action?: string;
  description?: string;
}
