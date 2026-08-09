export interface GitLabPipeline {
  id: number;
  sha: string;
  status: 'success' | 'failed' | 'pending' | 'running';
  ref: string;
}

export interface GitLabCommit {
  id: string;
  title: string;
  message: string;
  author_name: string;
  created_at: string;
}

export interface GitLabErrorResponse {
  message: string;
}
