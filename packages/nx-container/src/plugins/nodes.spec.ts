import { CreateNodesContextV2, workspaceRoot } from '@nx/devkit';
import { calculateHashForCreateNodes } from '@nx/devkit/src/utils/calculate-hash-for-create-nodes';
import { vol } from 'memfs';
import { createNodes, PLUGIN_NAME } from './nodes';

// Mock fs everywhere else with the memfs version.
vi.mock('node:fs', async () => {
  const memfs = await vi.importActual('memfs');

  // Support both `import fs from "node:fs"` and "import { readFileSync } from "node:fs"`
  return { default: memfs.fs, ...(memfs.fs as any) };
});

vi.mock('@nx/devkit/src/utils/calculate-hash-for-create-nodes', () => {
  return {
    calculateHashForCreateNodes: vi.fn().mockResolvedValue('mock-hash'),
  };
});

describe(`Plugin: ${PLUGIN_NAME}`, () => {
  const TEMP_WS_ROOT = '/workspace-root';
  let context: CreateNodesContextV2;
  const createNodesFunction = createNodes[1];

  beforeEach(() => {
    // reset the state of in-memory fs
    vol.reset();

    context = {
      nxJsonConfiguration: {
        namedInputs: {
          default: ['{projectRoot}/**/*'],
          production: ['!{projectRoot}/**/*.spec.ts'],
        },
      },
      workspaceRoot: TEMP_WS_ROOT,
    };

    // workaround for https://github.com/nrwl/nx/issues/20330
    const projectDir = `${workspaceRoot}/packages/container-metadata`;
    if (process.cwd() !== projectDir) {
      process.chdir(projectDir);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create nodes if there is a project.json', async () => {
    vol.fromJSON(
      {
        './apps/app-with-project/Dockerfile': 'FROM node:lts',
        './apps/app-with-project/index.ts': '',
        './apps/app-with-project/project.json': JSON.stringify({ name: 'app-with-project' }),
      },
      TEMP_WS_ROOT,
    );

    const nodes = await createNodesFunction(
      [`${TEMP_WS_ROOT}/apps/app-with-project/Dockerfile`],
      {
        buildTargetName: 'build',
        defaultEngine: 'docker',
      },
      context,
    );

    expect(nodes).toMatchInlineSnapshot(`
      [
        [
          "/workspace-root/apps/app-with-project/Dockerfile",
          {
            "projects": {
              "/workspace-root/apps/app-with-project": {
                "targets": {
                  "build": {
                    "configurations": {
                      "ci": {
                        "load": false,
                        "metadata": {
                          "images": [
                            "docker.io/app-with-project",
                          ],
                          "tags": [
                            "type=schedule",
                            "type=ref,event=branch",
                            "type=ref,event=tag",
                            "type=ref,event=pr",
                            "type=sha,prefix=sha-",
                          ],
                        },
                        "push": true,
                      },
                    },
                    "dependsOn": [
                      "build",
                    ],
                    "executor": "@nx-tools/nx-container:build",
                    "options": {
                      "engine": "docker",
                      "load": true,
                      "tags": [
                        "docker.io/app-with-project:dev",
                      ],
                    },
                  },
                },
              },
            },
          },
        ],
      ]
    `);
    expect(calculateHashForCreateNodes).toHaveBeenCalled();
  });

  it.skip('should create nodes if there is a package.json', async () => {
    vol.fromJSON(
      {
        './apps/app-with-package/Dockerfile': 'FROM node:lts',
        './apps/app-with-package/index.ts': '',
        './apps/app-with-package/package.json': JSON.stringify({ name: 'app-with-package' }),
      },
      TEMP_WS_ROOT,
    );

    const nodes = await createNodesFunction(
      [`${TEMP_WS_ROOT}/apps/app-with-package/Dockerfile`],
      {
        buildTargetName: 'build',
        defaultEngine: 'docker',
      },
      context,
    );

    expect(nodes).toMatchInlineSnapshot(`
      [
        [
          "/workspace-root/apps/app-with-package/Dockerfile",
          {
            "projects": {
              "/workspace-root/apps/app-with-package": {
                "targets": {
                  "build": {
                    "configurations": {
                      "ci": {
                        "load": false,
                        "metadata": {
                          "images": [
                            "docker.io/app-with-package",
                          ],
                          "tags": [
                            "type=schedule",
                            "type=ref,event=branch",
                            "type=ref,event=tag",
                            "type=ref,event=pr",
                            "type=sha,prefix=sha-",
                          ],
                        },
                        "push": true,
                      },
                    },
                    "dependsOn": [
                      "build",
                    ],
                    "executor": "@nx-tools/nx-container:build",
                    "options": {
                      "engine": "docker",
                      "load": true,
                      "tags": [
                        "docker.io/app-with-package:dev",
                      ],
                    },
                  },
                },
              },
            },
          },
        ],
      ]
    `);
    expect(calculateHashForCreateNodes).toHaveBeenCalled();
  });

  it.skip('should not create nodes if there is no project.json or package.json', async () => {
    vol.fromJSON(
      {
        './apps/no-project/Dockerfile': 'FROM node:lts',
        './apps/no-project/index.ts': '',
      },
      TEMP_WS_ROOT,
    );

    const nodes = await createNodesFunction(
      [`${TEMP_WS_ROOT}/apps/no-project/Dockerfile`],
      {
        buildTargetName: 'build',
        defaultEngine: 'docker',
      },
      context,
    );

    expect(nodes).toMatchInlineSnapshot(`
      [
        [
          "/workspace-root/apps/no-project/Dockerfile",
          {},
        ],
      ]
    `);
    expect(calculateHashForCreateNodes).not.toHaveBeenCalled();
  });
});
