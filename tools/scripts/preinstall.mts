/**
 * Pre-install script to validate development environment requirements
 *
 * Validates:
 * - Node.js version (22.0+)
 * - Package manager (pnpm recommended)
 * - Basic environment setup
 */

import { execSync } from 'node:child_process';
import { error, info, start, success, warn } from './console.mts';

// Skip validation in CI environments
if (process.env.CI) {
  process.exit(0);
}

/**
 * Configuration for minimum required versions
 */
const REQUIREMENTS = {
  node: {
    major: 22,
    minor: 0,
    patch: 0,
  },
};

/**
 * Parse semantic version string into components
 * @param {string} version - Version string (e.g., "20.19.1")
 * @returns {{major: number, minor: number, patch: number}} Parsed version
 */
function parseVersion(version) {
  const cleanVersion = version.replace(/^v/, '');
  const [major, minor, patch] = cleanVersion.split('.').map((num) => parseInt(num, 10) || 0);
  return { major, minor, patch };
}

/**
 * Compare two semantic versions
 * @param {object} current - Current version object
 * @param {object} required - Required version object
 * @returns {boolean} True if current version meets requirements
 */
function isVersionValid(current, required) {
  if (current.major > required.major) return true;
  if (current.major < required.major) return false;

  if (current.minor > required.minor) return true;
  if (current.minor < required.minor) return false;

  return current.patch >= required.patch;
}

/**
 * Check if pnpm is available and recommend it
 */
function checkPackageManager() {
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    success('pnpm detected');
  } catch {
    warn('pnpm not detected. Consider using pnpm for better performance and dependency management.');
    info('Install pnpm: npm install -g pnpm');
  }
}

/**
 * Validate Node.js version requirements
 */
function validateNodeVersion() {
  const nodeVersion = process.versions.node;
  const currentVersion = parseVersion(nodeVersion);
  const requiredVersion = REQUIREMENTS.node;

  info(`Checking Node.js version: v${nodeVersion}`);

  if (!isVersionValid(currentVersion, requiredVersion)) {
    error(
      `❌ Node.js v${requiredVersion.major}.${requiredVersion.minor}.${requiredVersion.patch}+ is required, but you have v${nodeVersion}`,
    );
    info('Please update Node.js to continue:');
    info('- Visit https://nodejs.org/');
    info('- Or use a version manager like mise, nvm, fnm, or volta');
    process.exit(1);
  }

  success(`Node.js v${nodeVersion} meets requirements`);
}

/**
 * Main validation function
 */
function main() {
  try {
    start('🔍 Validating development environment...');

    validateNodeVersion();
    checkPackageManager();

    success('🎉 Environment validation completed successfully!');
  } catch (err) {
    error('❌ Environment validation failed:', err.message);
    process.exit(1);
  }
}

// Run validation
main();
