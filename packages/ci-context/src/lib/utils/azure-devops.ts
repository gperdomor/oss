/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RepoMetadata, RunnerContext } from '../interfaces.js';

export class Azure {
  public static async context(): Promise<RunnerContext> {
    return {
      name: 'AZURE',
      actor: process.env['BUILD_SOURCEVERSIONAUTHOR']!,
      eventName: process.env['SYSTEM_PULLREQUEST_PULLREQUESTID'] ? 'pull_request' : 'unknown',
      job: process.env['AGENT_JOBNAME']!,
      payload: {},
      ref: process.env['SYSTEM_PULLREQUEST_SOURCEBRANCH'] || (process.env['BUILD_SOURCEBRANCH'] as string),
      runId: parseInt(process.env['BUILD_BUILDID']!, 10),
      runNumber: parseInt(process.env['BUILD_BUILDID']!, 10),
      repoUrl: process.env['BUILD_REPOSITORY_URI']!,
      sha: process.env['BUILD_SOURCEVERSION']!,
    };
  }
}

export async function repo(): Promise<RepoMetadata> {
  return {
    default_branch: '',
    description: '',
    html_url: process.env['BUILD_REPOSITORY_URI']!,
    license: null,
    name: process.env['AGENT_JOBNAME']!,
  };
}
