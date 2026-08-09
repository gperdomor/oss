import type { GitLabErrorResponse } from './gitlab-types.js';

export interface GitLabHttpClientOptions {
  url: string;
  project: string;
  headers: Record<string, string>;
  timeout?: number;
}

export class GitLabClient {
  private readonly options: GitLabHttpClientOptions;
  private readonly DEFAULT_TIMEOUT = 5_000;

  constructor(options: GitLabHttpClientOptions) {
    this.options = options;
  }

  async get<T>(endpoint: string, params?: URLSearchParams): Promise<T> {
    const url = new URL(`${this.options.url}/projects/${this.options.project}${endpoint}`);
    if (params) {
      url.search = params.toString();
    }

    const response = await fetch(url.toString(), {
      headers: this.options.headers,
      signal: AbortSignal.timeout(this.options.timeout ?? this.DEFAULT_TIMEOUT),
    });

    if (!response.ok) {
      const error = (await response.json()) as GitLabErrorResponse;
      throw new Error(error.message);
    }

    return response.json() as Promise<T>;
  }
}
