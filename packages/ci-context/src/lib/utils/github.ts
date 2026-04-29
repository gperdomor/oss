import * as github from '@actions/github';
import { existsSync, readFileSync } from 'fs';
import { logger } from '@nx-tools/core';
import { Payload, RepoMetadata, RunnerContext } from '../interfaces.js';

export class Github {
  public static async context(): Promise<RunnerContext> {
    const actor = process.env['GITHUB_ACTOR'] ?? '';
    const eventName = process.env['GITHUB_EVENT_NAME'] ?? '';
    const job = process.env['GITHUB_JOB'] ?? '';
    const ref = process.env['GITHUB_REF'] ?? '';
    const runId = parseInt(process.env['GITHUB_RUN_ID'] ?? '0', 10);
    const runNumber = parseInt(process.env['GITHUB_RUN_NUMBER'] ?? '0', 10);
    const sha = process.env['GITHUB_SHA'] ?? '';
    const serverUrl = process.env['GITHUB_SERVER_URL'] ?? 'https://github.com';
    const repository = process.env['GITHUB_REPOSITORY'] ?? '';
    const [owner, repo] = repository.split('/');

    let repoUrl = '';
    let payload: Partial<Payload> = {};

    try {
      repoUrl = `${serverUrl}/${owner}/${repo}`;
    } catch (err) {
      logger.warn(err);
    }

    try {
      const eventPath = process.env['GITHUB_EVENT_PATH'];
      if (eventPath && existsSync(eventPath)) {
        payload = JSON.parse(readFileSync(eventPath, { encoding: 'utf8' })) as Partial<Payload>;
      }
    } catch (err) {
      logger.warn(err);
    }

    return {
      name: 'GITHUB',
      actor,
      eventName,
      job,
      payload,
      ref,
      runId,
      runNumber,
      repoUrl,
      sha,
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
