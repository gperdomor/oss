<p align="center">
  <a href="https://www.npmjs.com/package/@nx-tools/nx-prisma">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/@nx-tools/nx-prisma"/>
  </a>
  <a href="https://www.npmjs.com/package/@nx-tools/nx-prisma">
    <img alt="NPM Type Definitions" src="https://img.shields.io/npm/types/@nx-tools/nx-prisma"/>
  </a>
  <a href="https://bundlephobia.com/package/@nx-tools/nx-prisma">
    <img alt="Minizipped Size" src="https://img.shields.io/bundlephobia/minzip/@nx-tools/nx-prisma" />
  </a>
  <a href="https://github.com/gperdomor/oss/blob/main/LICENSE">
    <img alt="GitHub License" src="https://img.shields.io/github/license/gperdomor/oss"/>
  </a>
  <a href="https://www.npmjs.com/package/@nx-tools/nx-prisma">
    <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/@nx-tools/nx-prisma"/>
  </a>
</p>

# @nx-tools/nx-prisma

The Nx Plugin for Prisma contains executors, generators, and utilities for managing Prisma applications within an Nx workspace. It provides:

- Integration with [Prisma CLI](https://www.npmjs.com/package/prisma)
- Generators to help to setup your apps quickly

## Setting up the Prisma plugin

Adding the Prisma plugin to an existing Nx workspace can be done with the following:

```bash
npm install -D @nx-tools/nx-prisma
```

```bash
yarn add -D @nx-tools/nx-prisma
```

## Using the Prisma Plugin

### Configuring an application

It's straightforward to setup your application:

```bash
nx g @nx-tools/nx-prisma:configuration appName
```

By default, the application will be configured with:

- A Prisma schema in the application root.
- A set of targets and executors to invoke common prisma commands to manage your application. You can add more executors later.

We can then call generate, deploy, migrate, db pull, db push prisma commands, and even start prisma studio with the following commands:

```bash
nx prisma-generate appName
nx prisma-deploy appName
nx prisma-migrate appName
nx prisma-pull appName
nx prisma-push appName
nx prisma-studio appName
nx prisma-validate appName
```

> Tip: You can change the location or rename your prisma file, but should live inside the project folder and the `options.schema` property of your project target needs to be updated with the relative path to the new schema location.

## Package reference

Here is a list of all the executors and generators available from this package:

### Executors

- deploy: Apply pending migrations to update the database schema in production/staging.
- generate: Generate artifacts (e.g. Prisma Client).
- migrate: Create a migration from changes in Prisma schema, apply it to the database, trigger generators (e.g. Prisma Client).
- pull: Pull the schema from an existing database, updating the Prisma schema.
- push: Push the Prisma schema state to the database.
- reset: Reset your database and apply all migrations, all data will be lost.
- resolve: Resolve issues with database migrations in deployment databases.
- seed: Seed your database.
- status: Check the status of your database migrations.
- studio: Browse your data with Prisma Studio.
- validate: validate your Prisma schema.

### Generators

- init: Setup Prisma for your app

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
- [NPM Package](https://www.npmjs.com/package/@nx-tools/nx-prisma) - Latest releases and installation information
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
