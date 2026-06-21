import { parse } from 'csv-parse/sync';
import { getInput } from './get-input.js';

export interface ListOpts {
  ignoreComma?: boolean;
  comment?: string;
  quote?: string | boolean | Buffer | null;
  prefix?: string;
  fallback?: string[];
}

export function getInputList(name: string, opts?: ListOpts): string[] {
  return getList(getInput(name, { prefix: opts?.prefix }), opts);
}

export function getList(input: string, opts?: ListOpts): string[] {
  const res: Array<string> = [];
  if (input == '') {
    return opts?.fallback ?? res;
  }

  const records = parse(input, {
    columns: false,
    relaxQuotes: true,
    comment: opts?.comment,
    relaxColumnCount: true,
    skipEmptyLines: true,
    quote: opts?.quote,
  });

  for (const record of records as Array<string[]>) {
    if (record.length == 1) {
      if (opts?.ignoreComma) {
        res.push(record[0]);
      } else {
        res.push(...record[0].split(','));
      }
    } else if (!opts?.ignoreComma) {
      res.push(...record);
    } else {
      res.push(record.join(','));
    }
  }

  return res.filter((item) => item).map((pat) => pat.trim());
}
