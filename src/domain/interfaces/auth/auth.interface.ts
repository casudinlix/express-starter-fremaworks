export interface IRegisterDTO {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface ILoginDTO {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: any;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
