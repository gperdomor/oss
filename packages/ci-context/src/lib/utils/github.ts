import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context.js';
import { logger } from '@nx-tools/core';
import { Payload, RepoMetadata, RunnerContext } from '../interfaces.js';

export class Github {
  public static async context(): Promise<RunnerContext> {
    const ctx = new Context();
    const { actor, eventName, job, ref, runId, runNumber, sha, serverUrl, payload } = ctx;

    let repoUrl = '';

    try {
      repoUrl = `${serverUrl}/${ctx.repo.owner}/${ctx.repo.repo}`;
    } catch (err) {
      logger.warn(err);
    }

    return {
      name: 'GITHUB',
      actor,
      eventName,
      job,
      payload: payload as unknown as Payload,
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
