import { Response } from 'express';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ResponseFormatter {
  static success<T>(res: Response, data?: T, message?: string, statusCode: number = 200) {
    const response: ApiResponse<T> = {
      success: true,
      message: message || 'Success',
      data,
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data?: T, message?: string) {
    return this.success(res, data, message || 'Resource created successfully', 201);
  }

  static error(res: Response, message: string, statusCode: number = 500) {
    const response: ApiResponse = {
      success: false,
      message,
    };

    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ) {
    const response: ApiResponse<T[]> = {
      success: true,
      message: message || 'Success',
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return res.status(200).json(response);
  }
}
