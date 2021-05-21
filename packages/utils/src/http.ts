import axios, {
  AxiosRequestConfig,
  AxiosInstance,
  AxiosResponse,
  Method
} from "axios";

export type RequestInterceptor = [
  (
    value: AxiosRequestConfig
  ) => AxiosRequestConfig | Promise<AxiosRequestConfig>,
  ((error: unknown) => unknown) | undefined
];

export type ResponseInterceptor = [
  (
    | ((
        value: AxiosResponse<unknown>
      ) => AxiosResponse<unknown> | Promise<AxiosResponse<unknown>>)
    | undefined
  ),
  ((error: unknown) => unknown) | undefined
];

export default class Http {
  instance: AxiosInstance;

  constructor(
    defaults: AxiosRequestConfig,
    requestInterceptors: RequestInterceptor[],
    responseInterceptors: ResponseInterceptor[]
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

  async request(options: AxiosRequestConfig): Promise<unknown> {
    const res = await this.instance.request(options);

    return Promise.resolve(res);
  }

  post(url: string, options: AxiosRequestConfig = {}): Promise<unknown> {
    const method: Method = "POST";

    return this.request({ method, url, ...options });
  }

  put(url: string, options: AxiosRequestConfig = {}): Promise<unknown> {
    const method: Method = "PUT";

    return this.request({ method, url, ...options });
  }

  patch(url: string, options: AxiosRequestConfig = {}): Promise<unknown> {
    const method: Method = "PATCH";

    return this.request({ method, url, ...options });
  }

  get(url: string, options: AxiosRequestConfig = {}): Promise<unknown> {
    const method: Method = "GET";

    return this.request({ method, url, ...options });
  }

  delete(url: string, options: AxiosRequestConfig = {}): Promise<unknown> {
    const method: Method = "DELETE";

    return this.request({ method, url, ...options });
  }
}
