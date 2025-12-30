import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import config from '../../config';
import logger from '../../shared/utils/pinoLogger';

export class HttpService {
  private static instance: AxiosInstance;

  static getInstance(): AxiosInstance {
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: config.externalApi.baseUrl,
        timeout: config.externalApi.timeout,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.externalApi.apiKey,
        },
      });

      // Request interceptor
      this.instance.interceptors.request.use(
        (config) => {
          logger.info(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
          return config;
        },
        (error) => {
          logger.error('HTTP Request Error:', error);
          return Promise.reject(error);
        }
      );

      // Response interceptor
      this.instance.interceptors.response.use(
        (response) => {
          logger.info(`HTTP Response: ${response.status} ${response.config.url}`);
          return response;
        },
        (error: AxiosError) => {
          if (error.response) {
            logger.error(
              `HTTP Response Error: ${error.response.status} ${error.config?.url}`,
              error.response.data
            );
          } else if (error.request) {
            logger.error('HTTP Request Error: No response received', error.request);
          } else {
            logger.error('HTTP Error:', error.message);
          }
          return Promise.reject(error);
        }
      );
    }

    return this.instance;
  }

  /**
   * GET request
   */
  static async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.getInstance().get(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  static async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.getInstance().post(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  static async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.getInstance().put(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  static async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.getInstance().patch(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  static async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.getInstance().delete(url, config);
    return response.data;
  }

  /**
   * Create a new instance with custom config
   */
  static createInstance(baseURL: string, customConfig?: AxiosRequestConfig): AxiosInstance {
    return axios.create({
      baseURL,
      timeout: config.externalApi.timeout,
      ...customConfig,
    });
  }
}
