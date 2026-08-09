import { Hook } from '@oclif/core';
import { styleText } from 'node:util';

/**
 * Configuration for minimum required versions
 */
const REQUIREMENTS = {
  node: {
    major: 20,
    minor: 19,
    patch: 0,
  },
};

/**
 * Compare two semantic versions
 * @param {object} current - Current version object
 * @param {object} required - Required version object
 * @returns {boolean} True if current version meets requirements
 */
function isVersionValid(current: Record<string, number>, required: Record<string, number>): boolean {
  if (current.major > required.major) return true;
  if (current.major < required.major) return false;

  if (current.minor > required.minor) return true;
  if (current.minor < required.minor) return false;

  return current.patch >= required.patch;
}

const hook: Hook<'init'> = async function (options) {
  const [major, minor, patch] = process.versions.node.split('.').map((n) => parseInt(n, 10));
  const current = { major, minor, patch };

  if (!isVersionValid(current, REQUIREMENTS.node)) {
    options.context.error(
      styleText(
        'red',
        `Node.js v${REQUIREMENTS.node.major}.${REQUIREMENTS.node.minor}.${REQUIREMENTS.node.patch} or newer is required to run this tool. Current version: v${process.versions.node}. Please upgrade Node.js and try again.`,
      ),
    );
  }
};

export default hook;
