import { CONFIG } from '../constants/config';

class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiRequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = CONFIG.API_URL;
  }

  private async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<T> {
    const { method = 'GET', headers = {}, body, timeout = CONFIG.API_TIMEOUT } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(response.status, `API isteği başarısız: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `API isteği başarısız: ${error.message}`);
    }
  }

  async uploadImage(imageUri: string): Promise<FormData> {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'image.jpg';
    
    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: 'image/jpeg',
    } as any);

    return formData;
  }
}

export const apiService = new ApiService();