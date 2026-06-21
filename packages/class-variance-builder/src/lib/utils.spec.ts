import { falsyToString, isEmpty, mergeDefaultsAndProps } from './utils.js';

describe('falsyToString', () => {
  it('should return a string when given a boolean', () => {
    expect(falsyToString(true)).toBe('true');
    expect(falsyToString(false)).toBe('false');
  });

  it('should return 0 when given 0', () => {
    expect(falsyToString(0)).toBe('0');
  });

  it('should return the original value when given a value other than 0 or a boolean', () => {
    expect(falsyToString('sandbox')).toBe('sandbox');
    expect(falsyToString(2)).toBe(2);
    expect(falsyToString(null)).toBe(null);
  });
});

describe('isEmpty', () => {
  it('should return true if object is empty', () => {
    expect(isEmpty({})).toBe(true);
  });

  it('should return false if object is not empty', () => {
    expect(isEmpty({ prop: 'value' })).toBe(false);
    expect(isEmpty({ prop: undefined })).toBe(false);
  });
});

describe('mergeDefaultsAndProps', () => {
  type P = Parameters<typeof mergeDefaultsAndProps>[0];
  type D = Parameters<typeof mergeDefaultsAndProps>[1];
  it.each<[number, P, D, ReturnType<typeof mergeDefaultsAndProps>]>([
    // @ts-expect-error Testing outside of types
    [1, undefined, undefined, {}],
    [2, undefined, {}, {}],
    // @ts-expect-error Testing outside of types
    [3, {}, undefined as D, {}],
    [4, { size: 'md' }, {}, { size: 'md' }],
    [5, { size: 'lg', color: 'red' }, {}, { size: 'lg', color: 'red' }],
    [6, { size: 'lg', color: 'red' }, { size: 'sm' }, { size: 'lg', color: 'red' }],
    [7, {}, { size: 'sm' }, { size: 'sm' }],
    [8, {}, { size: 'sm', disabled: true }, { size: 'sm', disabled: true }],
    [8, { disabled: false }, { size: 'sm', disabled: true }, { size: 'sm', disabled: false }],
  ])('%d - Given props=%o and defaults=%o, should return %o', (_, props, defaults, expected) => {
    expect(mergeDefaultsAndProps(props, defaults)).toEqual(expected);
  });
});
