<p align="center">
  <a href="https://www.npmjs.com/package/@nx-tools/nx-set-shas">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/@nx-tools/nx-set-shas"/>
  </a>
  <a href="https://www.npmjs.com/package/@nx-tools/nx-set-shas">
    <img alt="NPM Type Definitions" src="https://img.shields.io/npm/types/@nx-tools/nx-set-shas"/>
  </a>
  <a href="https://bundlephobia.com/package/@nx-tools/nx-set-shas">
    <img alt="Minizipped Size" src="https://img.shields.io/bundlephobia/minzip/@nx-tools/nx-set-shas" />
  </a>
  <a href="https://github.com/gperdomor/oss/blob/main/LICENSE">
    <img alt="GitHub License" src="https://img.shields.io/github/license/gperdomor/oss"/>
  </a>
  <a href="https://www.npmjs.com/package/@nx-tools/nx-set-shas">
    <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/@nx-tools/nx-set-shas"/>
  </a>
</p>

# @nx-tools/nx-set-shas

A GitLab CI integration for [Nx](https://nx.dev) that automatically detects base and head SHAs for `nx affected` commands. This package is a GitLab-native fork of the original nx-set-shas tool, optimized for GitLab pipelines with full support for merge requests, push events, and monorepo workflows.

## Overview

In monorepo environments with Nx, running only affected tests and builds is critical for CI/CD performance. This tool automatically determines the correct `NX_BASE` and `NX_HEAD` environment variables by:

- Detecting the last successful pipeline on your main branch
- Identifying the commits that changed between base and head
- Supporting both push and merge request workflows
- Handling edge cases like rebased branches and empty repositories

## Features

- ✅ **GitLab CI Native** - Built specifically for GitLab pipelines with full environment variable support
- ✅ **Merge Request Support** - Intelligent merge base detection for merge requests
- ✅ **Fallback Strategies** - Multiple fallback options (custom SHA, HEAD~1, or empty tree)
- ✅ **Pipeline Caching** - Efficiently queries GitLab API with pagination
- ✅ **Error Handling** - Graceful error handling with optional strict mode
- ✅ **Environment Export** - Export SHAs to `.env` files for downstream jobs
- ✅ **TypeScript Support** - Full TypeScript definitions included
- ✅ **Node 20.19+ Ready** - Modern Node.js versions with ES modules

## Installation

```bash
npm install @nx-tools/nx-set-shas
# or
pnpm add @nx-tools/nx-set-shas
# or
yarn add @nx-tools/nx-set-shas
```

## Usage

### As a CLI Command

```bash
nx-set-shas gitlab
```

### In GitLab CI Pipeline

Add to your `.gitlab-ci.yml`:

```yaml
set_shas:
  stage: .pre
  image: node:22-alpine
  script:
    - npx @nx-tools/nx-set-shas gitlab -o nx.env
  artifacts:
    reports:
      dotenv: nx.env
  only:
    - branches
    - merge_requests
```

Then use the exported variables in subsequent jobs:

```yaml
test_affected:
  stage: test
  image: node:22-alpine
  dependencies:
    - set_shas
  script:
    - source nx.env
    - npm run affected:test -- --base=$NX_BASE --head=$NX_HEAD
  only:
    - branches
    - merge_requests
```

### Options

All options can be passed as CLI flags or via environment variables. Environment variables take precedence when both are provided.

```
FLAGS
  -b, --branch=<value>
      The "main" branch of your repository (default: main)
      [env: CI_DEFAULT_BRANCH]

  -d, --working-directory=<value>
      The directory where your repository is located (default: .)

  -f, --fallback=<value>
      Fallback SHA to use if no successful pipeline is found
      (useful for newly set up repositories)

  -o, --output=<value>
      Generate a file with NX_BASE and NX_HEAD as environment variables

  -p, --project=<value>
      The ID of the GitLab project (required)
      [env: CI_PROJECT_ID]

  -r, --remote=<value>
      The name of the remote to fetch from (default: origin)

  -t, --token=<value>
      GitLab API authentication token
      If not provided, the CI Job token will be used (CI_JOB_TOKEN)

  -u, --url=<value>
      The GitLab API URL (default: https://gitlab.com/api/v4)
      [env: CI_API_V4_URL]

  --error-on-no-successful-pipeline
      Exit with error if no successful pipeline is found (default: false)

  --last-successful-event=<value>
      Type of event to check (default: push)
      Options: push, merge_request_event

  --json
      Output results as JSON
```

### Examples

**Basic usage with default settings:**

```bash
nx-set-shas gitlab
```

**Specify custom branch and project:**

```bash
nx-set-shas gitlab --branch develop --project 12345
```

**Export to environment file:**

```bash
nx-set-shas gitlab --output nx.env
```

**With custom fallback SHA:**

```bash
nx-set-shas gitlab --fallback abc123def456
```

**Strict mode - error if no pipeline found:**

```bash
nx-set-shas gitlab --error-on-no-successful-pipeline
```

**Using custom authentication token:**

```bash
nx-set-shas gitlab --token $GITLAB_TOKEN --project 12345
```

**JSON output for programmatic use:**

```bash
nx-set-shas gitlab --json
```

## How It Works

### For Push Events

1. Queries the GitLab API for the last **successful** pipeline on the main branch
2. Extracts the commit SHA from that pipeline
3. Validates the commit exists locally and on the remote branch
4. Returns `NX_BASE` (that commit) and `NX_HEAD` (current HEAD)

### For Merge Requests

1. Detects merge request using `CI_MERGE_REQUEST_IID` environment variable
2. Calculates merge base between target branch and current HEAD
3. Uses `git merge-base` to find the common ancestor
4. Returns accurate diff for only the changes in the MR

### Fallback Behavior

If no successful pipeline is found on the main branch:

1. **With `--fallback`**: Uses the provided custom SHA
2. **Without `--fallback`** (default):
   - Tries to use `HEAD~1` on the main branch
   - Falls back to the empty git tree hash if `HEAD~1` doesn't exist
3. **With `--error-on-no-successful-pipeline`**: Exits with an error code

## GitLab CI Integration Details

### Required Environment Variables

The following variables are automatically available in GitLab CI:

- `CI_DEFAULT_BRANCH` - Your repository's default branch
- `CI_PROJECT_ID` - The numeric project ID
- `CI_JOB_TOKEN` - Authentication token for API access
- `CI_API_V4_URL` - GitLab API endpoint
- `CI_MERGE_REQUEST_IID` - Merge request ID (if running on MR)
- `CI_MERGE_REQUEST_TARGET_BRANCH_NAME` - Target branch for MR

### Job Token Permissions

The CI Job token automatically has permission to:

- Read pipeline information
- Access commit details
- Query repository information

No additional token setup is required in most cases.

### Custom Authentication

If you need to use a custom token (e.g., for cross-project access):

1. Create a personal or project access token in GitLab
2. Add it as a CI/CD variable (e.g., `GITLAB_TOKEN`)
3. Pass it to the command: `--token $GITLAB_TOKEN`

## Performance Considerations

- **API Queries**: Tool queries GitLab API with pagination (100 results per page)
- **Git Operations**: Uses local git commands for merge base calculation
- **Caching**: No persistent caching; each run makes fresh API calls
- **Pipeline Stage**: Recommended to run in early pipeline stage (e.g., `prepare` stage)

## Troubleshooting

### "Unable to find a successful pipeline run"

This typically occurs on:

- **New repositories**: No successful pipelines exist on the main branch
- **Solution**: Use `--fallback` or `--error-on-no-successful-pipeline`

### "Commit no longer exists"

Happens when:

- **Rebased branches**: Commits were force-pushed
- **Solution**: The tool falls back to HEAD~1 or custom fallback

### Authentication Errors

Check:

- GitLab token has API access permissions
- Token is not expired
- Project ID is correct
- API URL is correct (especially for self-hosted GitLab)

### "Working directory doesn't exist"

Ensure the `--working-directory` path is valid and exists in the CI environment.

## Community

Join the growing Nx Tools community! We believe in building together and welcome contributors of all experience levels.

### Get Involved

- **Report Issues**: Found a bug or have a suggestion? [Open an issue](https://github.com/gperdomor/oss/issues/new/choose) on GitHub
- **Ask Questions**: Need help or clarification? Start a conversation in [GitHub Discussions](https://github.com/gperdomor/oss/discussions)
- **Contribute Code**: Pull requests are welcome! Check our [contribution guidelines](https://github.com/gperdomor/oss/blob/main/CONTRIBUTING.md) to get started
- **Share Your Work**: Built something with Nx Tools? Share it with the community in the [Showcase discussion](https://github.com/gperdomor/oss/discussions/categories/show-and-tell)
- **Spread the Word**: Star the [repository](https://github.com/gperdomor/oss), share on social media, or write about your experience

### Resources

- [GitHub Repository](https://github.com/gperdomor/oss) - Source code, issues, and project management
- [GitHub Discussions](https://github.com/gperdomor/oss/discussions) - Community conversations and support
- [NPM Package](https://www.npmjs.com/package/@nx-tools/nx-set-shas) - Latest releases and installation information
  <!-- - [Documentation](https://nx-tools.vercel.app) - Comprehensive guides and API reference -->
- [Code of Conduct](https://github.com/gperdomor/oss/blob/main/CODE_OF_CONDUCT.md) - Our community standards and expectations

Your feedback and contributions help make Nx Tools better for everyone!

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/gperdomor/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/gperdomor/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](https://github.com/gperdomor/oss/blob/main/LICENSE) License © [Gustavo Perdomo](https://github.com/gperdomor)
