/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { readFile } from 'fs/promises';
import { getProperties } from 'properties-file';
import * as url from 'url';
import { RepoMetadata, RunnerContext } from '../interfaces.js';
import { Git } from './git.js';

export type BuildProperties = Awaited<ReturnType<typeof Teamcity.getProperties>>['buildProperties'];
export type ConfigProperties = Awaited<ReturnType<typeof Teamcity.getProperties>>['configProperties'];

// TeamCity docs: https://www.jetbrains.com/help/teamcity/predefined-build-parameters.html
export class Teamcity {
  public static async context(): Promise<RunnerContext> {
    const { buildProperties, configProperties } = await Teamcity.getProperties();

    return {
      name: 'TEAMCITY',
      actor: (await Teamcity.actor(configProperties)) || (await Git.getCommitUserEmail().catch(() => 'n/a')),
      eventName: configProperties['teamcity.build.triggeredBy'] || 'unknown',
      job: buildProperties['teamcity.buildConfName']!,
      payload: {},
      ref: Teamcity.ref(configProperties) || '',
      runId: parseInt(buildProperties['teamcity.build.id'], 10),
      runNumber: parseInt(buildProperties['build.number'], 10),
      repoUrl: Teamcity.getRepoURL(configProperties) || '',
      sha: buildProperties['build.vcs.number'],
    };
  }

  public static async getProperties() {
    const buildPropertiesFile = await readFile(process.env['TEAMCITY_BUILD_PROPERTIES_FILE']!, 'utf8');
    const buildProperties = getProperties(buildPropertiesFile);

    const configPropertiesFile = await readFile(buildProperties['teamcity.configuration.properties.file'], 'utf8');
    const configProperties = getProperties(configPropertiesFile);

    return { buildProperties, configProperties };
  }

  public static actor(configProperties: ConfigProperties) {
    const actor = configProperties['teamcity.build.triggeredBy.username'];
    if (actor === 'n/a') return;
    return actor;
  }

  public static ref(configProperties: ConfigProperties) {
    let [, branch] =
      Object.entries(configProperties).find(([key]) => key.startsWith('teamcity.build.vcs.branch.')) ?? [];

    if (typeof branch !== 'string') {
      branch = configProperties['teamcity.build.branch'];
    }

    if (typeof branch !== 'string') return;

    if (branch.startsWith('refs/')) return branch;

    return `refs/heads/${branch}`;
  }

  public static getRepoURL(configProperties: ConfigProperties): string | undefined {
    let [, repo] =
      Object.entries(configProperties).find(([key]) => key.startsWith('vcsroot.') && key.endsWith('.url')) ?? [];

    if (typeof repo !== 'string') {
      repo = configProperties['vcsroot.url'];
    }

    if (typeof repo !== 'string') {
      return;
    }

    const ensureProto = !repo.match(/^(\w+:)?\/\//) ? '//' : '';

    // use node:url for ssh support, which URL doesn't have
    const repoURL = url.parse(ensureProto + repo.replace(/\.git$/, ''));
    repoURL.host = repoURL.hostname;
    repoURL.auth = '';
    repoURL.protocol = 'https';
    repoURL.pathname = repoURL.pathname?.replace('/:', '/') ?? null;

    if (configProperties['version'] === 'gerrit') {
      const DEFAULT_GERRIT_SSH_PORT = '29418';
      repoURL.port = repoURL.port === DEFAULT_GERRIT_SSH_PORT ? null : repoURL.port;
      repoURL.pathname = repoURL.pathname ? `/q/project:` + encodeURIComponent(repoURL.pathname.substring(1)) : '';
    }

    return url.format(repoURL);
  }
}

export async function repo(): Promise<RepoMetadata> {
  const { buildProperties, configProperties } = await Teamcity.getProperties();

  return {
    default_branch: configProperties['git.main.branch'] || '',
    description: '',
    html_url: Teamcity.getRepoURL(configProperties) || '',
    license: null,
    name: buildProperties['teamcity.projectName'],
  };
}
