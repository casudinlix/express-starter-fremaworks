export interface IProducts {
  id: string;
  name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface IProductsCreate {
  name: string;
  description?: string;
}

export interface IProductsUpdate {
  name?: string;
  description?: string;
}
