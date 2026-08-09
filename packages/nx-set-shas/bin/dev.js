#!/usr/bin/env -S node --import tsx --disable-warning=ExperimentalWarning

import { execute } from '@oclif/core';
import { createLoadOptions } from '../src/load-options.ts';

const loadOptions = createLoadOptions();

await execute({ development: true, dir: import.meta.url, loadOptions });
