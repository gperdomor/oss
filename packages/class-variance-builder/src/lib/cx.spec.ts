/* eslint-disable no-constant-condition, no-constant-binary-expression */
import { cx } from './cvb.js';

describe('cx', () => {
  it('should handle undefined values', () => {
    expect(cx()).toBe('');
    expect(cx(undefined)).toBe('');
    expect(cx(undefined, 'foo')).toBe('foo');
    expect(cx('foo', undefined, 'bar')).toBe('foo bar');
  });

  it('should handle null values', () => {
    expect(cx(null)).toBe('');
    expect(cx(null, 'foo')).toBe('foo');
    expect(cx('foo', null, 'bar')).toBe('foo bar');
  });

  it('should handle string values', () => {
    expect(cx('')).toBe('');
    expect(cx('foo')).toBe('foo');
    expect(cx('foo bar')).toBe('foo bar');
    expect(cx('foo', 'bar')).toBe('foo bar');
    expect(cx('foo bar', 'foo2 bar2')).toBe('foo bar foo2 bar2');
    expect(cx('foo', '', 'bar')).toBe('foo bar');
  });

  it('should handle boolean values', () => {
    expect(cx(true)).toBe('');
    expect(cx(false)).toBe('');

    expect(cx(true && 'foo')).toBe('foo');
    expect(cx(false && 'foo')).toBe('');

    expect(cx('foo', true && 'bar')).toBe('foo bar');
    expect(cx('foo', false && 'bar')).toBe('foo');

    expect(cx(true ? 'foo' : 'bar')).toBe('foo');
    expect(cx(false ? 'foo' : 'bar')).toBe('bar');

    expect(cx('foo', true ? 'bar1' : 'bar2')).toBe('foo bar1');
    expect(cx('foo', false ? 'bar1' : 'bar2')).toBe('foo bar2');

    expect(cx('foo', true ? 'bar1' : 'bar2', 'baz')).toBe('foo bar1 baz');
    expect(cx('foo', false ? 'bar1' : 'bar2', 'baz')).toBe('foo bar2 baz');

    expect(cx('0')).toBe('0');
    expect(cx('7')).toBe('7');
  });

  it('should ignore numeric values', () => {
    // @ts-expect-error Testing outside of types
    expect(cx(0)).toBe('');
    // @ts-expect-error Testing outside of types
    expect(cx(7)).toBe('');
    // @ts-expect-error Testing outside of types
    expect(cx(-7)).toBe('');
    // @ts-expect-error Testing outside of types
    expect(cx(-0)).toBe('');
    // @ts-expect-error Testing outside of types
    expect(cx(1_000_000)).toBe('');
    // @ts-expect-error Testing outside of types
    expect(cx(1.5)).toBe('');
    // @ts-expect-error Testing outside of types
    expect(cx(333e9)).toBe('');
    // @ts-expect-error Testing outside of types
    expect(cx(Infinity)).toBe('');

    // @ts-expect-error Testing outside of types
    expect(cx(0, 'foo')).toBe('foo');
    // @ts-expect-error Testing outside of types
    expect(cx(7, 'bar')).toBe('bar');
  });

  it('should ignore object values', () => {
    // @ts-expect-error Testing outside of types
    expect(cx({})).toBe('');
    // @ts-expect-error Testing outside of types
    expect(cx({ foo: 'bar' })).toBe('');

    // @ts-expect-error Testing outside of types
    expect(cx({}, 'foo')).toBe('foo');
  });

  it('should ignore arrays values', () => {
    // @ts-expect-error Testing outside of types
    expect(cx([])).toBe('');
    // @ts-expect-error Testing outside of types
    expect(cx(['foo'])).toBe('');
    // @ts-expect-error Testing outside of types
    expect(cx([[['foo']]])).toBe('');

    expect(cx(...['foo', 'bar'])).toBe('foo bar');
    // @ts-expect-error Testing outside of types
    expect(cx([[['foo']]], 'bar')).toBe('bar');
  });

  it('should ignore function values', () => {
    // @ts-expect-error Testing outside of types
    expect(cx(() => '')).toBe('');
    // @ts-expect-error Testing outside of types
    expect(cx(() => 'foo')).toBe('');

    // @ts-expect-error Testing outside of types
    expect(cx(() => 'foo', 'bar')).toBe('bar');
  });
});
