export interface IRole {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IRoleCreate {
  name: string;
  slug: string;
  description?: string;
}

export interface IRoleUpdate {
  name?: string;
  slug?: string;
  description?: string;
}

export interface IRoleWithPermissions extends IRole {
  permissions: string[];
}
