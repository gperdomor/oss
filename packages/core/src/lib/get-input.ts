import { names } from '@nx/devkit';
import { toBoolean } from './utils.js';

/**
 * Interface for getInput options
 */
export interface InputOptions {
  /** Optional. Whether the input is required. If required and not present, will throw. Defaults to false */
  required?: boolean;

  /** Optional. Whether leading/trailing whitespace will be trimmed for the input. Defaults to true */
  trimWhitespace?: boolean;

  /** Optional. Default value */
  fallback?: string;

  /** Optional. Default value */
  prefix?: string;
}

export const getPosixName = (name: string) => names(`input-${name.toLowerCase()}`).constantName;

/**
 * Gets the value of an input.
 * Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
 * Returns an empty string if the value is not defined.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
export function getInput(name: string, options?: InputOptions): string {
  let val = '';
  const prefix = options?.prefix;

  if (prefix) {
    val = process.env[getPosixName(`${prefix}_${name}`)] || '';
  }

  if (!val) {
    val = process.env[getPosixName(name)] || '';
  }

  if (!val && options?.fallback) {
    val = options.fallback;
  }

  if (options?.required && !val) {
    throw new Error(`Input required and not supplied: ${name}`);
  }

  if (options?.trimWhitespace === false) {
    return val;
  }

  return val.trim();
}

/**
 * Gets the values of an multiline input.  Each value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string[]
 *
 */
export function getMultilineInput(name: string, options?: InputOptions): string[] {
  const inputs: string[] = getInput(name, options)
    .split('\n')
    .filter((x) => x !== '');

  if (options?.trimWhitespace === false) {
    return inputs;
  }

  return inputs.map((input) => input.trim());
}

/**
 * Gets the input value of the boolean type in the YAML 1.2 "core schema" specification.
 * Support boolean input list: `true | True | TRUE | false | False | FALSE` .
 * The return value is also in boolean type.
 * ref: https://yaml.org/spec/1.2/spec.html#id2804923
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   boolean
 */
export function getBooleanInput(name: string, options?: InputOptions): boolean {
  const val = getInput(name, options);

  return toBoolean(val);
}
