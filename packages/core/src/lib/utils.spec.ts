import { toBoolean } from './utils.js';

describe('utils', () => {
  describe('toBoolean', () => {
    describe('boolean inputs', () => {
      it('should return true for boolean true', () => {
        expect(toBoolean(true)).toBe(true);
      });

      it('should return false for boolean false', () => {
        expect(toBoolean(false)).toBe(false);
      });
    });

    describe('string inputs', () => {
      describe('truthy string values', () => {
        it('should return true for "true" (case-insensitive)', () => {
          expect(toBoolean('true')).toBe(true);
          expect(toBoolean('TRUE')).toBe(true);
          expect(toBoolean('True')).toBe(true);
          expect(toBoolean('TrUe')).toBe(true);
        });

        it('should return true for "1"', () => {
          expect(toBoolean('1')).toBe(true);
        });

        it('should return true for "yes" (case-insensitive)', () => {
          expect(toBoolean('yes')).toBe(true);
          expect(toBoolean('YES')).toBe(true);
          expect(toBoolean('Yes')).toBe(true);
          expect(toBoolean('YeS')).toBe(true);
        });

        it('should return true for "on" (case-insensitive)', () => {
          expect(toBoolean('on')).toBe(true);
          expect(toBoolean('ON')).toBe(true);
          expect(toBoolean('On')).toBe(true);
          expect(toBoolean('oN')).toBe(true);
        });

        it('should handle whitespace around truthy values', () => {
          expect(toBoolean('  true  ')).toBe(true);
          expect(toBoolean('\ttrue\t')).toBe(true);
          expect(toBoolean('\n1\n')).toBe(true);
          expect(toBoolean('  yes  ')).toBe(true);
          expect(toBoolean('  on  ')).toBe(true);
        });
      });

      describe('falsy string values', () => {
        it('should return false for "false"', () => {
          expect(toBoolean('false')).toBe(false);
          expect(toBoolean('FALSE')).toBe(false);
          expect(toBoolean('False')).toBe(false);
        });

        it('should return false for "0"', () => {
          expect(toBoolean('0')).toBe(false);
        });

        it('should return false for "no"', () => {
          expect(toBoolean('no')).toBe(false);
          expect(toBoolean('NO')).toBe(false);
          expect(toBoolean('No')).toBe(false);
        });

        it('should return false for "off"', () => {
          expect(toBoolean('off')).toBe(false);
          expect(toBoolean('OFF')).toBe(false);
          expect(toBoolean('Off')).toBe(false);
        });

        it('should return false for empty string', () => {
          expect(toBoolean('')).toBe(false);
        });

        it('should return false for whitespace-only strings', () => {
          expect(toBoolean('   ')).toBe(false);
          expect(toBoolean('\t\t')).toBe(false);
          expect(toBoolean('\n\n')).toBe(false);
        });

        it('should return false for arbitrary strings', () => {
          expect(toBoolean('invalid')).toBe(false);
          expect(toBoolean('maybe')).toBe(false);
          expect(toBoolean('hello')).toBe(false);
          expect(toBoolean('2')).toBe(false);
          expect(toBoolean('-1')).toBe(false);
        });
      });
    });

    describe('number inputs', () => {
      it('should return false for 0', () => {
        expect(toBoolean(0)).toBe(false);
      });

      it('should return false for -0', () => {
        expect(toBoolean(-0)).toBe(false);
      });

      it('should return true for positive numbers', () => {
        expect(toBoolean(1)).toBe(true);
        expect(toBoolean(42)).toBe(true);
        expect(toBoolean(3.14)).toBe(true);
        expect(toBoolean(Infinity)).toBe(true);
      });

      it('should return true for negative numbers', () => {
        expect(toBoolean(-1)).toBe(true);
        expect(toBoolean(-42)).toBe(true);
        expect(toBoolean(-3.14)).toBe(true);
        expect(toBoolean(-Infinity)).toBe(true);
      });

      it('should return true for NaN', () => {
        expect(toBoolean(NaN)).toBe(true);
      });
    });

    describe('null and undefined inputs', () => {
      it('should return false for null', () => {
        expect(toBoolean(null)).toBe(false);
      });

      it('should return false for undefined', () => {
        expect(toBoolean(undefined)).toBe(false);
      });
    });

    describe('object inputs', () => {
      it('should return true for empty array', () => {
        expect(toBoolean([])).toBe(true);
      });

      it('should return true for non-empty array', () => {
        expect(toBoolean([1, 2, 3])).toBe(true);
      });

      it('should return true for empty object', () => {
        expect(toBoolean({})).toBe(true);
      });

      it('should return true for non-empty object', () => {
        expect(toBoolean({ key: 'value' })).toBe(true);
      });

      it('should return true for function', () => {
        expect(toBoolean(() => 'test')).toBe(true);
        expect(
          toBoolean(function () {
            return 'test';
          }),
        ).toBe(true);
      });

      it('should return true for Date object', () => {
        expect(toBoolean(new Date())).toBe(true);
      });

      it('should return true for RegExp object', () => {
        expect(toBoolean(/pattern/)).toBe(true);
      });
    });

    describe('symbol inputs', () => {
      it('should return true for symbols', () => {
        expect(toBoolean(Symbol('test'))).toBe(true);
        expect(toBoolean(Symbol.iterator)).toBe(true);
      });
    });

    describe('bigint inputs', () => {
      it('should return false for 0n', () => {
        expect(toBoolean(0n)).toBe(false);
      });

      it('should return true for non-zero bigint', () => {
        expect(toBoolean(1n)).toBe(true);
        expect(toBoolean(-1n)).toBe(true);
        expect(toBoolean(42n)).toBe(true);
      });
    });

    describe('edge cases', () => {
      it('should handle mixed case with extra whitespace', () => {
        expect(toBoolean('  TrUe  ')).toBe(true);
        expect(toBoolean('\t\nYeS\t\n')).toBe(true);
        expect(toBoolean('  ON  ')).toBe(true);
      });

      it('should handle numbers as strings that are not 0 or 1', () => {
        expect(toBoolean('2')).toBe(false);
        expect(toBoolean('10')).toBe(false);
        expect(toBoolean('-1')).toBe(false);
        expect(toBoolean('3.14')).toBe(false);
      });

      it('should handle boolean-like strings that are not exact matches', () => {
        expect(toBoolean('truthy')).toBe(false);
        expect(toBoolean('falsy')).toBe(false);
        expect(toBoolean('TRUE_VALUE')).toBe(false);
        expect(toBoolean('enable')).toBe(false);
        expect(toBoolean('disable')).toBe(false);
      });
    });
  });
});
