import { execSync } from '@nx-tools/core';
import { Command, Flags } from '@oclif/core';
import { colorize } from '@oclif/core/ux';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const DEFAULT_WORKING_DIRECTORY = '.';
const EVENT_OPTIONS = ['push', 'merge_request_event'] as const;
type MrEventType = (typeof EVENT_OPTIONS)[number];

export const stripNewLineEndings = (string: string): string => string.replace(/[\r\n]+$/g, '');

export default class Gitlab extends Command {
  static override enableJsonFlag = true;
  static override description = 'Find the base and head SHAs required for the nx affected commands in GitLab CI';
  static override examples = [
    `<%= config.bin %> <%= command.id %>`,
    `<%= config.bin %> <%= command.id %> --json`,
    `<%= config.bin %> <%= command.id %> --token $GITLAB_TOKEN`,
    `<%= config.bin %> <%= command.id %> --o nx.env`,
    `<%= config.bin %> <%= command.id %> --branch main --project 123456 --remote origin --token $GITLAB_TOKEN`,
  ];
  static override flags = {
    branch: Flags.string({
      char: 'b',
      default: 'main',
      description:
        'The "main" branch of your repository (the base branch which you target with PRs). Common names for this branch include main and master.',
      env: 'CI_DEFAULT_BRANCH',
    }),
    'error-on-no-successful-pipeline': Flags.boolean({
      default: false,
      description:
        'By default, if no successful pipeline is found on the main branch to determine the SHA, we will log a warning and use HEAD~1. Enable this option to error and exit instead.',
    }),
    fallback: Flags.string({
      char: 'f',
      default: '',
      description:
        'Fallback SHA to use if no successful pipeline run is found. This can be useful in scenarios where you need a specific commit as a reference for comparison, especially in newly set up repositories or those with sparse pipeline runs.',
    }),
    'last-successful-event': Flags.string({
      default: 'push',
      description:
        'The type of event to check for the last successful commit corresponding to that pipeline, e.g. push, merge_request, etc.',
      options: EVENT_OPTIONS,
    }),
    output: Flags.string({
      char: 'o',
      description:
        'Generate a file with the derived SHAs for base and head as NX_BASE and NX_HEAD environment variables within the current Job.',
    }),
    url: Flags.string({
      char: 'u',
      description: 'The GitLab API URL.',
      env: 'CI_API_V4_URL',
      default: 'https://gitlab.com/api/v4',
      required: true,
    }),
    project: Flags.string({
      char: 'p',
      description: 'The ID of the GitLab project.',
      env: 'CI_PROJECT_ID',
      required: true,
    }),
    remote: Flags.string({
      char: 'r',
      default: 'origin',
      description: 'The name of the remote to fetch from.',
    }),
    token: Flags.string({
      char: 't',
      description: 'GitLab API authentication token. If is not provided, the CI Job token will be used.',
    }),
    'working-directory': Flags.string({
      char: 'd',
      default: DEFAULT_WORKING_DIRECTORY,
      description: 'The directory where your repository is located.',
    }),
  };

  public async run(): Promise<{ NX_BASE: string; NX_HEAD: string }> {
    const { flags } = await this.parse(Gitlab);
    const {
      remote,
      branch,
      fallback,
      project,
      token,
      output,
      'working-directory': workingDirectory,
      'error-on-no-successful-pipeline': errorOnNoSuccessfulPipeline,
      'last-successful-event': lastSuccessfulEvent,
      url,
    } = flags;

    this.setupWorkingDirectory(workingDirectory);

    let BASE_SHA: string | undefined;
    let HEAD_SHA = this.getHEAD();

    const eventName = process.env.CI_MERGE_REQUEST_IID ? 'merge_request_event' : '';

    if (eventName === 'merge_request_event' && process.env.CI_MERGE_REQUEST_EVENT_TYPE !== 'merged_result') {
      BASE_SHA = await this.getBASE(remote);
    } else {
      try {
        BASE_SHA = await this.findSuccessfulCommit({
          lastSuccessfulEvent: lastSuccessfulEvent as MrEventType,
          branch,
          project,
          token,
          url,
        });
      } catch (e) {
        this.error(`${e instanceof Error ? e.message : String(e)}`, { code: 'NO_SUCCESSFUL_PIPELINE', exit: 1 });
      }

      if (!BASE_SHA) {
        if (errorOnNoSuccessfulPipeline) {
          this.error(
            colorize(
              'red',
              [
                `Unable to find a successful pipeline run on 'origin/${branch}'`,
                `NOTE: You have set 'error-on-no-successful-pipeline' on the action so this is a hard error.`,
                `Is it possible that you have no runs currently on 'origin/${branch}'?`,
                `- If yes, then you should run the pipeline without this flag first.`,
                `- If no, then you might have changed your git history and those commits no longer exist.`,
                `\n`,
              ].join('\n'),
            ),
            { code: 'NO_SUCCESSFUL_PIPELINE', exit: 1 },
          );
        } else {
          this.log(
            colorize(
              'yellow',
              `\nWARNING: Unable to find a successful pipeline run on '${remote}/${branch}', or the latest successful pipeline was connected to a commit which no longer exists on that branch (e.g. if that branch was rebased).\n`,
            ),
          );

          if (fallback) {
            BASE_SHA = fallback;
            this.log(`Using provided fallback SHA: ${BASE_SHA}\n`);
          } else {
            // Check if HEAD~1 exists, and if not, set BASE_SHA to the empty tree hash
            const LAST_COMMIT_CMD = `${remote}/${branch}~1`;
            const baseRes = execSync('git', ['rev-parse', LAST_COMMIT_CMD], { nodeOptions: { encoding: 'utf-8' } });

            if (baseRes.exitCode !== 0 || !baseRes.stdout.trim()) {
              const emptyTreeRes = execSync('git', ['hash-object', '-t', 'tree', '/dev/null'], {
                nodeOptions: { encoding: 'utf-8' },
              });

              // 4b825dc642cb6eb9a060e54bf8d69288fbee4904 is the expected result of hashing the empty tree
              BASE_SHA = emptyTreeRes.stdout ?? `4b825dc642cb6eb9a060e54bf8d69288fbee4904`;
              this.log(
                colorize(
                  'yellow',
                  `HEAD~1 does not exist. We are therefore defaulting to use the empty git tree hash as BASE.\n`,
                ),
              );
            } else {
              this.log(colorize('yellow', `We are therefore defaulting to use HEAD~1 on '${remote}/${branch}'\n`));

              BASE_SHA = baseRes.stdout.trim();
            }

            this.log(
              `NOTE: You can instead make this a hard error by setting 'error-on-no-successful-pipeline' on the action in your pipeline.\n`,
            );
          }
        }
      } else {
        this.log(
          ['', `Found the last successful pipeline run on '${remote}/${branch}'`, `Commit: ${BASE_SHA}`, ''].join('\n'),
        );
      }
    }

    BASE_SHA = stripNewLineEndings(BASE_SHA);
    HEAD_SHA = stripNewLineEndings(HEAD_SHA);

    this.log(colorize('blue', [`NX_BASE: ${BASE_SHA}`, `NX_HEAD: ${HEAD_SHA}`].join('\n')));

    let lines: string[] = [];

    if (output) {
      if (existsSync(output)) {
        const variables = readFileSync(output).toString('utf-8').split('\n');
        lines = variables.filter(
          (variable) => !(variable.startsWith('NX_BASE=') || variable.startsWith('NX_HEAD=') || variable === ''),
        );
      }
      lines.push(`NX_BASE=${BASE_SHA}`, `NX_HEAD=${HEAD_SHA}`);
      writeFileSync(output, lines.join('\n'), { encoding: 'utf-8' });
      this.log(colorize('blue', `\nNX_BASE and NX_HEAD environment variables have been written to '${output} file'\n`));
    }

    return {
      NX_BASE: BASE_SHA,
      NX_HEAD: HEAD_SHA,
    };
  }

  setupWorkingDirectory(workingDirectory: string) {
    if (workingDirectory !== DEFAULT_WORKING_DIRECTORY) {
      if (existsSync(workingDirectory)) {
        process.chdir(workingDirectory);
      } else {
        this.log(colorize('yellow', `\nWARNING: Working directory '${workingDirectory}' doesn't exist.\n`));
      }
    }
  }

  getBASE(remote: string): string {
    const cmd = execSync(
      'git',
      ['merge-base', `${remote}/${process.env.CI_MERGE_REQUEST_TARGET_BRANCH_NAME}`, 'HEAD'],
      { nodeOptions: { encoding: 'utf-8' } },
    );
    return cmd.stdout.trim();
  }

  getHEAD(): string {
    const cmd = execSync('git', ['rev-parse', 'HEAD'], { nodeOptions: { encoding: 'utf-8' } });
    return cmd.stdout.trim();
  }

  async findSuccessfulCommit({
    branch,
    lastSuccessfulEvent,
    project,
    url,
    token,
  }: {
    branch: string;
    lastSuccessfulEvent: MrEventType;
    project: string;
    url: string;
    token?: string;
  }): Promise<string | undefined> {
    const params = new URLSearchParams({
      per_page: '100',
      scope: 'finished',
      source: lastSuccessfulEvent,
      status: 'success',
    });

    if (lastSuccessfulEvent === 'push') {
      params.append('ref', branch);
    }

    const headers: Record<string, string> = token
      ? { 'PRIVATE-TOKEN': token }
      : { 'JOB-TOKEN': process.env['CI_JOB_TOKEN'] ?? '' };

    const response = await fetch(`${url}/projects/${project}/pipelines?${params.toString()}`, {
      headers,
      signal: AbortSignal.timeout(5_000),
    });

    let shas: string[];

    if (response.ok) {
      const json = (await response.json()) as { sha: string }[];
      shas = json.map((pipeline) => pipeline.sha);
    } else {
      const json = (await response.json()) as { message: string };
      throw new Error(json.message);
    }

    return this.findExistingCommit(url, project, headers, branch, shas);
  }

  async findExistingCommit(
    url: string,
    project: string,
    headers: Record<string, string>,
    branchName: string,
    shas: string[],
  ): Promise<string | undefined> {
    for (const commitSha of shas) {
      if (await this.commitExists(url, project, headers, branchName, commitSha)) {
        return commitSha;
      }
    }
    return undefined;
  }

  async commitExists(
    url: string,
    project: string,
    headers: Record<string, string>,
    branch: string,
    sha: string,
  ): Promise<boolean> {
    try {
      execSync('git', ['cat-file', '-e', sha], {
        nodeOptions: { stdio: ['pipe', 'pipe', null] },
        throwOnError: false,
      });

      // Check the commit exists in general
      let response = await fetch(`${url}/projects/${project}/repository/commits/${sha}`, {
        headers,
        signal: AbortSignal.timeout(5_000),
      });

      if (!response.ok) {
        const json = (await response.json()) as { message: string };
        throw new Error(json.message);
      }

      // Check the commit exists on the expected main branch (it will not in the case of a rebased main branch)
      const params = new URLSearchParams({
        ref_name: branch,
        per_page: '100',
      });

      response = await fetch(`${url}/projects/${project}/repository/commits?${params.toString()}`, {
        headers,
        signal: AbortSignal.timeout(5_000),
      });
      if (!response.ok) {
        const json = (await response.json()) as { message: string };
        throw new Error(json.message);
      }

      const commits = (await response.json()) as { id: string }[];

      return commits.some((commit: { id: string }) => commit.id === sha);
    } catch {
      return false;
    }
  }
}
