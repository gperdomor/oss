import { RunnerContext as Context, ContextProxyFactory, RepoMetadata, RepoProxyFactory } from '@nx-tools/ci-context';
import { isDebug, logger as L } from '@nx-tools/core';
import { ExecutorContext } from '@nx/devkit';
import * as fs from 'node:fs';
import { getInputs, Inputs } from './context.js';
import { Meta, Version } from './meta.js';

function setOutput(_name: string, _value: string) {
  // core.setOutput(name, value);
  // core.exportVariable(`DOCKER_METADATA_OUTPUT_${name.replace(/\W/g, '_').toUpperCase()}`, value);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export async function getMetadata(options: Partial<Inputs>, ctx?: ExecutorContext): Promise<Meta> {
  const inputs: Inputs = getInputs(options, ctx);
  const context: Context = await ContextProxyFactory.create();
  const repo: RepoMetadata = await RepoProxyFactory.create(inputs['github-token']);

  const logger: typeof L = {
    ...L,
    info: options.quiet ? noop : L.info,
    startGroup: options.quiet ? noop : L.startGroup,
    endGroup: options.quiet ? noop : L.endGroup,
  };

  let group = 'Context info';
  logger.startGroup(group);
  logger.info(`eventName: ${context.eventName}`);
  logger.info(`sha: ${context.sha}`);
  logger.info(`ref: ${context.ref}`);
  logger.info(`actor: ${context.actor}`);
  logger.info(`runNumber: ${context.runNumber}`);
  logger.info(`runId: ${context.runId}`);
  logger.endGroup(group);

  if (isDebug) {
    const group = 'Context payload';
    logger.startGroup(group);
    logger.info(JSON.stringify(context.payload, null, 2));
    logger.endGroup(group);
  }

  const meta: Meta = new Meta(inputs, context, repo, logger);

  const version: Version = meta.version;
  if (meta.version.main == undefined || meta.version.main.length == 0) {
    logger.warn(`No Docker image version has been generated. Check tags input.`);
  } else {
    const group = 'Docker image version';
    logger.startGroup(group);
    logger.info(version.main || '');
    logger.endGroup(group);
  }
  setOutput('version', version.main || '');

  // Docker tags
  const tags: Array<string> = meta.getTags();
  if (tags.length == 0) {
    logger.warn('No Docker tag has been generated. Check tags input.');
  } else {
    const group = 'Docker tags';
    logger.startGroup(group);
    for (const tag of tags) {
      logger.info(tag);
    }
    logger.endGroup(group);
  }
  setOutput('tags', tags.join(inputs['sep-tags']));

  // Docker labels
  const labels: Array<string> = meta.getLabels();
  group = 'Docker labels';
  logger.startGroup(group);
  for (const label of labels) {
    logger.info(label);
  }
  setOutput('labels', labels.join(inputs['sep-labels']));
  logger.endGroup(group);

  // Annotations
  const annotationsRaw: Array<string> = meta.getAnnotations();
  const annotationsLevels = process.env.DOCKER_METADATA_ANNOTATIONS_LEVELS || 'manifest';
  group = 'Annotations';
  logger.startGroup(group);
  const annotations: Array<string> = [];
  for (const level of annotationsLevels.split(',')) {
    annotations.push(
      ...annotationsRaw.map((label) => {
        const v = `${level}:${label}`;
        logger.info(v);
        return v;
      }),
    );
  }
  setOutput(`annotations`, annotations.join(inputs['sep-annotations']));
  logger.endGroup(group);

  // JSON
  const jsonOutput = meta.getJSON(annotationsLevels.split(','));
  group = 'JSON output';
  logger.startGroup(group);
  logger.info(JSON.stringify(jsonOutput, null, 2));
  setOutput('json', JSON.stringify(jsonOutput));
  logger.endGroup(group);

  // Bake files
  for (const kind of ['tags', 'labels', 'annotations:' + annotationsLevels]) {
    const outputName = kind.split(':')[0];
    const bakeFile: string = meta.getBakeFile(kind);
    const group = `Bake file definition (${outputName})`;
    logger.startGroup(group);
    logger.info(fs.readFileSync(bakeFile, 'utf8'));
    setOutput(`bake-file-${outputName}`, bakeFile);
    logger.endGroup(group);
  }

  // Bake file with tags and labels
  setOutput(`bake-file`, `${meta.getBakeFileTagsLabels()}`);

  return meta;
}
