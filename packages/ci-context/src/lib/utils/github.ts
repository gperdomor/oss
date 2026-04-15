import * as github from '@actions/github';
import { logger } from '@nx-tools/core';
import { existsSync, readFileSync } from 'node:fs';
import { Payload, RepoMetadata, RunnerContext } from '../interfaces.js';

export class Github {
  public static async context(): Promise<RunnerContext> {
    let payload: Partial<Payload> = {};
    const eventPath = process.env['GITHUB_EVENT_PATH'];
    if (eventPath && existsSync(eventPath)) {
      payload = JSON.parse(readFileSync(eventPath, { encoding: 'utf8' })) as Partial<Payload>;
    }

    const serverUrl = process.env['GITHUB_SERVER_URL'] ?? 'https://github.com';

    let repoUrl = '';
    try {
      const repository = process.env['GITHUB_REPOSITORY'];
      if (repository) {
        const [owner, repo] = repository.split('/');
        repoUrl = `${serverUrl}/${owner}/${repo}`;
      }
    } catch (err) {
      logger.warn(err);
    }

    return {
      name: 'GITHUB',
      actor: process.env['GITHUB_ACTOR'] ?? '',
      eventName: process.env['GITHUB_EVENT_NAME'] ?? '',
      job: process.env['GITHUB_JOB'] ?? '',
      payload,
      ref: process.env['GITHUB_REF'] ?? '',
      runId: parseInt(process.env['GITHUB_RUN_ID'] ?? '0', 10),
      runNumber: parseInt(process.env['GITHUB_RUN_NUMBER'] ?? '0', 10),
      repoUrl,
      sha: process.env['GITHUB_SHA'] ?? '',
    };
  }
}

export async function repo(token?: string): Promise<RepoMetadata> {
  if (!token) {
    throw new Error(`Missing github token`);
  }

  const response = await github.getOctokit(token).rest.repos.get({
    ...github.context.repo,
  });

  const { default_branch, description, html_url, license, name } = response.data;

  return {
    default_branch,
    description,
    html_url,
    license,
    name,
  };
}
