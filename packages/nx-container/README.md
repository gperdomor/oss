<p align="center">
  <a href="https://www.npmjs.com/package/@nx-tools/nx-container">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/@nx-tools/nx-container"/>
  </a>
  <a href="https://www.npmjs.com/package/@nx-tools/nx-container">
    <img alt="NPM Type Definitions" src="https://img.shields.io/npm/types/@nx-tools/nx-container"/>
  </a>
  <a href="https://bundlephobia.com/package/@nx-tools/nx-container">
    <img alt="Minizipped Size" src="https://img.shields.io/bundlephobia/minzip/@nx-tools/nx-container" />
  </a>
  <a href="https://github.com/gperdomor/oss/blob/main/LICENSE">
    <img alt="GitHub License" src="https://img.shields.io/github/license/gperdomor/oss"/>
  </a>
  <a href="https://www.npmjs.com/package/@nx-tools/nx-container">
    <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/@nx-tools/nx-container"/>
  </a>
</p>

The `@nx-tools/nx-container` plugin streamlines container image workflows in Nx monorepos by providing a unified interface for multiple container build engines and automated image management capabilities.

## Key Features

- **Multi-Engine Support**: Build container images using your preferred container engine:
  - [Docker Buildx](https://github.com/docker/buildx) with [Moby BuildKit](https://github.com/moby/buildkit) for advanced build features
  - [Podman](https://docs.podman.io/en/latest/) for rootless and daemonless container builds
- **Automated Image Management**: Intelligent tag generation and [OCI Image Format Specification](https://github.com/opencontainers/image-spec/blob/master/annotations.md) compliant labeling
- **Project Scaffolding**: Code generators to quickly configure container builds for your applications

## Getting Started

### Installation

To add the `@nx-tools/nx-container` plugin to your Nx workspace, run the following command:

```package-install
npx nx add @nx-tools/nx-container
```

This command will:

- Install the plugin package
- Configure the plugin in your `nx.json` file
- Set up default configurations for your workspace

### Task Inference

The plugin automatically detects projects suitable for containerization and adds a `container` task to any project containing a `Dockerfile`. This intelligent inference eliminates the need for manual task configuration in most cases.

### Viewing Inferred Tasks

To inspect the automatically inferred tasks for any project:

- **Using Nx Console**: Open the [project details view](https://nx.dev/concepts/inferred-tasks) for comprehensive task visualization
- **Using CLI**: Execute `nx show project <project-name>` to display project configuration and available tasks

## Configuration

### Plugin Configuration

Configure the `@nx-tools/nx-container` plugin in your workspace's `nx.json` file within the `plugins` array:

```json title="nx.json"
{
  "plugins": [
    {
      "plugin": "@nx-tools/nx-container",
      "options": {
        "defaultEngine": "docker",
        "defaultRegistry": "docker.io"
      }
    }
  ]
}
```

### Alternative Engine Configuration

You can customize the default build engine and registry to match your infrastructure requirements:

```json title="nx.json"
{
  "plugins": [
    {
      "plugin": "@nx-tools/nx-container",
      "options": {
        "defaultEngine": "podman",
        "defaultRegistry": "ghcr.io"
      }
    }
  ]
}
```

**Supported Engines:**

- `docker` (default) - Standard Docker builds with BuildKit
- `podman` - Rootless container builds

**Common Registries:**

- `docker.io` - Docker Hub (default)
- `ghcr.io` - GitHub Container Registry
- `gcr.io` - Google Container Registry
- Custom registry URLs

## Build your application

```bash
nx container appName
```

To use a different engine, you need to update the `options.engine` property of your project target or use the INPUT_ENGINE environment variable. All possible values are `docker` (the default) and `podman`

> [!IMPORTANT]
> You can set docker or podman engine in your project.json targets to use in your dev machine, and use INPUT_ENGINE env variable to use docker in your CI/CD pipelines.

## More Documentation

- Advanced usage:
  - [Multi-platform image](https://nx-tools.vercel.app/docs/nx-container/guides/advanced/multi-platform)
  - [Push to multi-registries](https://nx-tools.vercel.app/docs/nx-container/guides/advanced/push-multiple-registries)
  - [Cache](https://nx-tools.vercel.app/docs/nx-container/guides/advanced/cache)
  - [Local registry](https://nx-tools.vercel.app/docs/nx-container/guides/advanced/local-registry)
  - [Export image to Docker](https://nx-tools.vercel.app/docs/nx-container/guides/advanced/export-docker)
  - [Handle tags and labels](https://nx-tools.vercel.app/docs/nx-container/guides/advanced/tags-labels)

- Usage with CI
  - [GitLab CI](https://nx-tools.vercel.app/docs/nx-container/guides/gitlab-ci)
  - [GitHub Actions](https://nx-tools.vercel.app/docs/nx-container/guides/github-actions)

- [Frequently Asked Questions](https://nx-tools.vercel.app/docs/nx-container/faq)

## Package reference

Here is a list of all the executors and generators available from this package:

### Executors

- build: Builds an image using instructions from the Dockerfile and a specified build context directory.

### Generators

- init: Initialize Container settings for your workspace.
- configuation: Configure Container builds for your application.

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
- [NPM Package](https://www.npmjs.com/package/@nx-tools/nx-container) - Latest releases and installation information
- [Documentation](https://nx-tools.vercel.app) - Comprehensive guides and API reference
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
