import {
  CreateDependencies,
  CreateNodes,
  CreateNodesContext,
  createNodesFromFiles,
  detectPackageManager,
  parseJson,
  readJsonFile,
  TargetConfiguration,
  writeJsonFile,
} from '@nx/devkit';
import { getLockFileName } from '@nx/js';
import { existsSync, readFileSync } from 'node:fs';
import { workspaceDataDirectory } from 'nx/src/utils/cache-directory';
import { dirname, join } from 'path';
import { DEFAULT_ENGINE, DEFAULT_REGISTRY } from '../generators/configuration/constants';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { calculateHashForCreateNodes } = (() => {
  // for compatibility with older versions of Nx
  try {
    const internal = require('@nx/devkit/internal');
    if (internal?.calculateHashForCreateNodes) {
      return internal;
    }
  } catch {
    // ignore
  }
  return require('@nx/devkit/src/utils/calculate-hash-for-create-nodes');
})();

export const PLUGIN_NAME = '@nx-tools/nx-container';

export interface ContainerPluginOptions {
  buildTargetName?: string;
  defaultEngine?: string;
  defaultRegistry?: string;
}

type NormalizedContainerPluginOptions = Required<ContainerPluginOptions>;

const cachePath = join(workspaceDataDirectory, 'container.hash');
const targetsCache = readTargetsCache();

function readTargetsCache(): Record<string, Record<string, TargetConfiguration<ContainerPluginOptions>>> {
  return existsSync(cachePath) ? readJsonFile(cachePath) : {};
}

function writeTargetsToCache() {
  writeJsonFile(cachePath, targetsCache);
}

export const createDependencies: CreateDependencies = () => {
  writeTargetsToCache();
  return [];
};

export const createNodesV2: CreateNodes<ContainerPluginOptions> = [
  '**/Dockerfile',
  async (configFiles, options, context) => {
    return await createNodesFromFiles(
      (configFile, options, context) => createNodesInternal(configFile, options, context),
      configFiles,
      options,
      context,
    );
  },
];

export const createNodes = createNodesV2;

async function createNodesInternal(
  configFilePath: string,
  options: ContainerPluginOptions | undefined,
  context: CreateNodesContext,
) {
  const normalized = normalizeOptions(options);
  const projectRoot = dirname(configFilePath);

  // Do not create a project if package.json and project.json isn't there.
  const isProject = existsSync(join(projectRoot, 'project.json')) || existsSync(join(projectRoot, 'package.json'));
  if (!isProject) {
    return {};
  }

  const hash = await calculateHashForCreateNodes(projectRoot, normalized, context, [
    getLockFileName(detectPackageManager(context.workspaceRoot)),
  ]);

  const projectName = buildProjectName(projectRoot, context.workspaceRoot, normalized);

  targetsCache[hash] ??= buildTargets(projectRoot, normalized, projectName);

  return {
    projects: {
      [projectRoot]: {
        targets: targetsCache[hash],
      },
    },
  };
}

function buildTargets(projectRoot: string, options: NormalizedContainerPluginOptions, projectName: string) {
  const targets: Record<string, TargetConfiguration> = {
    [options.buildTargetName]: {
      executor: '@nx-tools/nx-container:build',
      dependsOn: ['build'],
      options: {
        engine: options.defaultEngine,
        tags: [`${projectName}:dev`],
        load: true,
      },
      configurations: {
        ci: {
          load: false,
          push: true,
          metadata: {
            images: [projectName],
            tags: [
              'type=schedule',
              'type=ref,event=branch',
              'type=ref,event=tag',
              'type=ref,event=pr',
              'type=sha,prefix=sha-',
            ],
          },
        },
      },
    },
  };

  return targets;
}

function buildProjectName(projectRoot: string, workspaceRoot: string, options: ContainerPluginOptions): string {
  const packageJsonPath = join(projectRoot, 'package.json');
  const projectJsonPath = join(projectRoot, 'project.json');
  let name = '';
  const registry = options.defaultRegistry?.length ? `${options.defaultRegistry}/` : '';
  if (existsSync(projectJsonPath)) {
    const projectJson = parseJson(readFileSync(projectJsonPath, 'utf-8'));
    name = `${registry}${projectJson.name}`;
  } else if (existsSync(packageJsonPath)) {
    const packageJson = parseJson(readFileSync(packageJsonPath, 'utf-8'));
    name = `${registry}${packageJson.name}`;
  }
  return name.replace(/@/gi, '');
}

function normalizeOptions(options: ContainerPluginOptions | undefined): NormalizedContainerPluginOptions {
  return {
    buildTargetName: options?.buildTargetName ?? 'container',
    defaultEngine: options?.defaultEngine ?? DEFAULT_ENGINE,
    defaultRegistry: options?.defaultRegistry ?? DEFAULT_REGISTRY,
  };
}
