import { exec } from '@nx-tools/core';
import { RepoMetadata, RunnerContext } from '../interfaces.js';

export class Git {
  public static async context(): Promise<RunnerContext> {
    return {
      name: 'GIT',
      actor: await Git.getCommitUserEmail(),
      eventName: 'push',
      job: 'build',
      payload: {},
      ref: await Git.ref(),
      runId: 0,
      runNumber: 0,
      repoUrl: await Git.remoteURL(),
      sha: await Git.fullCommit(),
    };
  }

  public static async remoteURL(): Promise<string> {
    let rurl = await Git.exec(['remote', 'get-url', 'origin']);

    if (rurl.length == 0) {
      rurl = await Git.exec(['remote', 'get-url', 'upstream']);

      if (rurl.length == 0) {
        throw new Error(`Cannot find remote URL for origin or upstream`);
      }
    }

    return rurl;
  }

  public static async ref(): Promise<string> {
    const isHeadDetached = await Git.isHeadDetached();
    if (isHeadDetached) {
      return await Git.getDetachedRef();
    }

    return await Git.exec(['symbolic-ref', 'HEAD']);
  }

  public static async fullCommit(): Promise<string> {
    return await Git.exec(['show', '--format=%H', 'HEAD', '--quiet', '--']);
  }

  public static async tag(): Promise<string> {
    return await Git.exec(['tag', '--points-at', 'HEAD', '--sort', '-version:creatordate']).then((tags) => {
      if (tags.length == 0) {
        return Git.exec(['describe', '--tags', '--abbrev=0']);
      }
      return tags.split('\n')[0];
    });
  }

  public static async getCommitUserEmail(): Promise<string> {
    return await Git.exec(['log', '-1', '--pretty=format:%ae']);
  }

  private static async isHeadDetached(): Promise<boolean> {
    return await Git.exec(['branch', '--show-current']).then((res) => {
      return res.length == 0;
    });
  }

  private static async getDetachedRef(): Promise<string> {
    const res = await Git.exec(['show', '-s', '--pretty=%D']);

    // Can be "HEAD, <tagname>" or "grafted, HEAD, <tagname>"
    const refMatch = res.match(/^(grafted, )?HEAD, (.*)$/);

    if (!refMatch || !refMatch[2]) {
      throw new Error(`Cannot find detached HEAD ref in "${res}"`);
    }

    const ref = refMatch[2].trim();

    // Tag refs are formatted as "tag: <tagname>"
    if (ref.startsWith('tag: ')) {
      return `refs/tags/${ref.split(':')[1].trim()}`;
    }

    // Branch refs are formatted as "<origin>/<branch-name>, <branch-name>"
    const branchMatch = ref.match(/^[^/]+\/[^/]+, (.+)$/);
    if (branchMatch) {
      return `refs/heads/${branchMatch[1].trim()}`;
    }

    // Pull request merge refs are formatted as "pull/<number>/<state>"
    const prMatch = ref.match(/^pull\/\d+\/(head|merge)$/);
    if (prMatch) {
      return `refs/${ref}`;
    }

    throw new Error(`Unsupported detached HEAD ref in "${res}"`);
  }

  private static async exec(args: string[] = []): Promise<string> {
    const result = await exec(`git`, args, {
      throwOnError: false,
      silent: true,
    });

    if (result.stderr.length > 0 && result.exitCode != 0) {
      throw new Error(result.stderr);
    }

    return result.stdout.trim();
  }
}

export async function repo(): Promise<RepoMetadata> {
  return {
    default_branch: '',
    description: '',
    html_url: await Git.remoteURL(),
    license: null,
    name: '',
  };
}
