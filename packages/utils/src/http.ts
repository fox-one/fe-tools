import axios, { AxiosRequestConfig, AxiosInstance, Method } from "axios";

export default class Http {
  instance: AxiosInstance;

  constructor(
    defaults: AxiosRequestConfig,
    requestInterceptors: any[],
    responseInterceptors: any[]
  ) {
    this.instance = axios.create(defaults);

    for (const interceptor of requestInterceptors) {
      this.instance.interceptors.request.use(...interceptor);
    }

    for (const interceptor of responseInterceptors) {
      this.instance.interceptors.response.use(...interceptor);
    }
  }

  config(options: AxiosRequestConfig): void {
    this.instance.defaults.baseURL = options.baseURL;
  }

  async request(options: AxiosRequestConfig): Promise<any> {
    const res = await this.instance.request(options);

    return Promise.resolve(res);
  }

  post(url: string, options: AxiosRequestConfig = {}): Promise<any> {
    const method: Method = "POST";

    return this.request({ method, url, ...options });
  }

  put(url: string, options: AxiosRequestConfig = {}): Promise<any> {
    const method: Method = "PUT";

    return this.request({ method, url, ...options });
  }

  patch(url: string, options: AxiosRequestConfig = {}): Promise<any> {
    const method: Method = "PATCH";

    return this.request({ method, url, ...options });
  }

  get(url: string, options: AxiosRequestConfig = {}): Promise<any> {
    const method: Method = "GET";

    return this.request({ method, url, ...options });
  }

  delete(url: string, options: AxiosRequestConfig = {}): Promise<any> {
    const method: Method = "DELETE";

    return this.request({ method, url, ...options });
  }
}
