import { cvb } from './cvb.js';
import { RecipeDefinition, RecipeVariantRecord, VariantProps } from './types.js';

describe('cvb', () => {
  const badgeConfig: Required<RecipeDefinition<RecipeVariantRecord>> = {
    base: 'inline-flex items-center rounded-md gap-x-1.5 text-xs',
    variants: {
      color: {
        green: 'bg-green-50 text-green-700',
        indigo: 'bg-indigo-50 text-indigo-700',
      },
      size: {
        sm: 'px-1.5 py-0.5',
        md: 'px-2 py-1',
      },
      flat: {
        true: 'ring-0',
        false: 'ring-1 ring-inset',
      },
    },
    compoundVariants: [
      {
        color: 'green',
        flat: false,
        class: 'ring-green-600/20',
      },
      {
        color: 'indigo',
        flat: false,
        className: 'ring-indigo-700/10',
      },
    ],
    defaultVariants: {
      color: 'indigo',
      flat: true,
      size: 'md',
    },
  };

  describe('without anything', () => {
    it('undefined', () => {
      // @ts-expect-error props is invalid
      const example = cvb(undefined);
      expect(example()).toBe('');
      expect(
        example({
          aCheekyInvalidProp: 'lol',
        }),
      ).toBe('');
      expect(example({ class: 'adhoc-class' })).toBe('adhoc-class');
      expect(example({ className: 'adhoc-className' })).toBe('adhoc-className');
      expect(
        example({
          className: 'adhoc-className',
        }),
      ).toBe('adhoc-className');
    });

    it('null', () => {
      // @ts-expect-error props is invalid
      const example = cvb(null);
      expect(example()).toBe('');
      expect(
        example({
          aCheekyInvalidProp: 'lol',
        }),
      ).toBe('');
      expect(example({ class: 'adhoc-class' })).toBe('adhoc-class');
      expect(example({ className: 'adhoc-className' })).toBe('adhoc-className');
      expect(
        example({
          class: 'adhoc-class',
          // @ts-expect-error: Only one of class or className is allowed, with class taking precedence
          className: 'adhoc-className',
        }),
      ).toBe('adhoc-class');
    });

    it('empty variants', () => {
      const example = cvb({ variants: {} });
      expect(example()).toBe('');
      expect(
        example({
          // @ts-expect-error: This is not a valid variant and should be ignored
          aCheekyInvalidProp: 'lol',
        }),
      ).toBe('');
      expect(example({ class: 'adhoc-class' })).toBe('adhoc-class');
      expect(example({ className: 'adhoc-className' })).toBe('adhoc-className');
      expect(
        example({
          class: 'adhoc-class',
          // @ts-expect-error: Only one of class or className is allowed, with class taking precedence
          className: 'adhoc-className',
        }),
      ).toBe('adhoc-class');
    });

    it('undefined variants', () => {
      const example = cvb({ variants: undefined });
      expect(example()).toBe('');
      expect(
        example({
          aCheekyInvalidProp: 'lol',
        }),
      ).toBe('');
      expect(example({ class: 'adhoc-class' })).toBe('adhoc-class');
      expect(example({ className: 'adhoc-className' })).toBe('adhoc-className');
      expect(
        example({
          class: 'adhoc-class',
          // @ts-expect-error: Only one of class or className is allowed, with class taking precedence
          className: 'adhoc-className',
        }),
      ).toBe('adhoc-class');
    });
  });

  describe('without base', () => {
    describe('without defaults', () => {
      const badgeWithoutBaseWithoutDefaults = cvb({
        variants: badgeConfig.variants,
        compoundVariants: badgeConfig.compoundVariants,
      });

      type BadgeWithoutBaseWithoutDefaultsProps = VariantProps<typeof badgeWithoutBaseWithoutDefaults>;

      describe('empty parameters', () => {
        it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, string]>([
          [
            1,
            // @ts-expect-error Invalid variant
            undefined,
            '',
          ],
          [2, {}, ''],
          [3, { aCheekyInvalidProp: 'lol' } as BadgeWithoutBaseWithoutDefaultsProps, ''],
        ])('%d - badge(%o) return %o', (_, options, expected) => {
          expect(badgeWithoutBaseWithoutDefaults(options)).toBe(expected);
        });
      });

      describe('single parameter', () => {
        describe('color only', () => {
          it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, string]>([
            [1, { color: 'green' }, 'bg-green-50 text-green-700'],
            [2, { color: 'indigo' }, 'bg-indigo-50 text-indigo-700'],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithoutDefaults(options)).toBe(expected);
          });
        });

        describe('size only', () => {
          it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, string]>([
            [1, { size: 'sm' }, 'px-1.5 py-0.5'],
            [2, { size: 'md' }, 'px-2 py-1'],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithoutDefaults(options)).toBe(expected);
          });
        });

        describe('flat only', () => {
          it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, string]>([
            [1, { flat: true }, 'ring-0'],
            [2, { flat: false }, 'ring-1 ring-inset'],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithoutDefaults(options)).toBe(expected);
          });
        });
      });

      describe('two parameters', () => {
        describe('color + size combinations', () => {
          it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, string]>([
            [1, { color: 'green', size: 'sm' }, 'bg-green-50 text-green-700 px-1.5 py-0.5'],
            [2, { color: 'green', size: 'md' }, 'bg-green-50 text-green-700 px-2 py-1'],
            [3, { color: 'indigo', size: 'sm' }, 'bg-indigo-50 text-indigo-700 px-1.5 py-0.5'],
            [4, { color: 'indigo', size: 'md' }, 'bg-indigo-50 text-indigo-700 px-2 py-1'],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithoutDefaults(options)).toBe(expected);
          });
        });

        describe('color + flat combinations', () => {
          it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, string]>([
            [1, { color: 'green', flat: true }, 'bg-green-50 text-green-700 ring-0'],
            [2, { color: 'green', flat: false }, 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'],
            [3, { color: 'indigo', flat: true }, 'bg-indigo-50 text-indigo-700 ring-0'],
            [4, { color: 'indigo', flat: false }, 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10'],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithoutDefaults(options)).toBe(expected);
          });
        });

        describe('size + flat combinations', () => {
          it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, string]>([
            [1, { size: 'sm', flat: true }, 'px-1.5 py-0.5 ring-0'],
            [2, { size: 'sm', flat: false }, 'px-1.5 py-0.5 ring-1 ring-inset'],
            [3, { size: 'md', flat: true }, 'px-2 py-1 ring-0'],
            [4, { size: 'md', flat: false }, 'px-2 py-1 ring-1 ring-inset'],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithoutDefaults(options)).toBe(expected);
          });
        });
      });

      describe('three parameters', () => {
        describe('color + size + flat combinations', () => {
          it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, string]>([
            [1, { color: 'green', size: 'sm', flat: true }, 'bg-green-50 text-green-700 px-1.5 py-0.5 ring-0'],
            [
              2,
              { color: 'green', size: 'sm', flat: false },
              'bg-green-50 text-green-700 px-1.5 py-0.5 ring-1 ring-inset ring-green-600/20',
            ],
            [3, { color: 'green', size: 'md', flat: true }, 'bg-green-50 text-green-700 px-2 py-1 ring-0'],
            [
              4,
              { color: 'green', size: 'md', flat: false },
              'bg-green-50 text-green-700 px-2 py-1 ring-1 ring-inset ring-green-600/20',
            ],
            [5, { color: 'indigo', size: 'sm', flat: true }, 'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0'],
            [
              6,
              { color: 'indigo', size: 'sm', flat: false },
              'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-1 ring-inset ring-indigo-700/10',
            ],
            [7, { color: 'indigo', size: 'md', flat: true }, 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0'],
            [
              8,
              { color: 'indigo', size: 'md', flat: false },
              'bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10',
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithoutDefaults(options)).toBe(expected);
          });
        });
      });

      describe('handle overrides with class or className', () => {
        it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, string]>([
          [1, { color: 'green', class: 'custom-class-1' }, 'bg-green-50 text-green-700 custom-class-1'],
          [2, { size: 'md', className: 'custom-class-2' }, 'px-2 py-1 custom-class-2'],
          [3, { flat: true, class: 'custom-class-3' }, 'ring-0 custom-class-3'],
          [
            4,
            { color: 'green', size: 'md', className: 'custom-class-4' },
            'bg-green-50 text-green-700 px-2 py-1 custom-class-4',
          ],
          [
            5,
            { color: 'indigo', flat: true, class: 'custom-class-5' },
            'bg-indigo-50 text-indigo-700 ring-0 custom-class-5',
          ],
          [
            6,
            { size: 'sm', flat: false, className: 'custom-class-6' },
            'px-1.5 py-0.5 ring-1 ring-inset custom-class-6',
          ],
          [
            7,
            { color: 'green', size: 'md', flat: true, class: 'custom-class-7' },
            'bg-green-50 text-green-700 px-2 py-1 ring-0 custom-class-7',
          ],
        ])('%d - badge(%o) return %o', (_, options, expected) => {
          expect(badgeWithoutBaseWithoutDefaults(options)).toBe(expected);
        });
      });
    });

    describe('with defaults', () => {
      const badgeWithoutBaseWithDefaults = cvb({
        variants: badgeConfig.variants,
        compoundVariants: badgeConfig.compoundVariants,
        defaultVariants: badgeConfig.defaultVariants,
      });

      type BadgeWithoutBaseWithDefaultsProps = VariantProps<typeof badgeWithoutBaseWithDefaults>;

      describe('empty parameters', () => {
        it.each<[number, BadgeWithoutBaseWithDefaultsProps, string]>([
          [
            1,
            // @ts-expect-error Invalid variant
            undefined,
            'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
          ],
          [2, {}, 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0'],
          [
            3,
            { aCheekyInvalidProp: 'lol' } as BadgeWithoutBaseWithDefaultsProps,
            'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
          ],
        ])('%d - badge(%o) return %o', (_, options, expected) => {
          expect(badgeWithoutBaseWithDefaults(options)).toBe(expected);
        });
      });

      describe('single parameter', () => {
        describe('color only', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, string]>([
            [1, { color: 'green' }, 'bg-green-50 text-green-700 px-2 py-1 ring-0'],
            [2, { color: 'indigo' }, 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0'],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toBe(expected);
          });
        });

        describe('size only', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, string]>([
            [1, { size: 'sm' }, 'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0'],
            [2, { size: 'md' }, 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0'],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toBe(expected);
          });
        });

        describe('flat only', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, string]>([
            [1, { flat: true }, 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0'],
            [2, { flat: false }, 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10'],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toBe(expected);
          });
        });
      });

      describe('two parameters', () => {
        describe('color + size combinations', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, string]>([
            [1, { color: 'green', size: 'sm' }, 'bg-green-50 text-green-700 px-1.5 py-0.5 ring-0'],
            [2, { color: 'green', size: 'md' }, 'bg-green-50 text-green-700 px-2 py-1 ring-0'],
            [3, { color: 'indigo', size: 'sm' }, 'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0'],
            [4, { color: 'indigo', size: 'md' }, 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0'],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toBe(expected);
          });
        });

        describe('color + flat combinations', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, string]>([
            [1, { color: 'green', flat: true }, 'bg-green-50 text-green-700 px-2 py-1 ring-0'],
            [
              2,
              { color: 'green', flat: false },
              'bg-green-50 text-green-700 px-2 py-1 ring-1 ring-inset ring-green-600/20',
            ],
            [3, { color: 'indigo', flat: true }, 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0'],
            [
              4,
              { color: 'indigo', flat: false },
              'bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10',
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toBe(expected);
          });
        });

        describe('size + flat combinations', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, string]>([
            [1, { size: 'sm', flat: true }, 'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0'],
            [
              2,
              { size: 'sm', flat: false },
              'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-1 ring-inset ring-indigo-700/10',
            ],
            [3, { size: 'md', flat: true }, 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0'],
            [
              4,
              { size: 'md', flat: false },
              'bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10',
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toBe(expected);
          });
        });
      });

      describe('three parameters', () => {
        describe('color + size + flat combinations', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, string]>([
            [1, { color: 'green', size: 'sm', flat: true }, 'bg-green-50 text-green-700 px-1.5 py-0.5 ring-0'],
            [
              2,
              { color: 'green', size: 'sm', flat: false },
              'bg-green-50 text-green-700 px-1.5 py-0.5 ring-1 ring-inset ring-green-600/20',
            ],
            [3, { color: 'green', size: 'md', flat: true }, 'bg-green-50 text-green-700 px-2 py-1 ring-0'],
            [
              4,
              { color: 'green', size: 'md', flat: false },
              'bg-green-50 text-green-700 px-2 py-1 ring-1 ring-inset ring-green-600/20',
            ],
            [5, { color: 'indigo', size: 'sm', flat: true }, 'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0'],
            [
              6,
              { color: 'indigo', size: 'sm', flat: false },
              'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-1 ring-inset ring-indigo-700/10',
            ],
            [7, { color: 'indigo', size: 'md', flat: true }, 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0'],
            [
              8,
              { color: 'indigo', size: 'md', flat: false },
              'bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10',
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toBe(expected);
          });
        });
      });

      describe('handle overrides with class or className', () => {
        it.each<[number, BadgeWithoutBaseWithDefaultsProps, string]>([
          [
            1,
            { color: 'green', class: 'custom-class-1' },
            'bg-green-50 text-green-700 px-2 py-1 ring-0 custom-class-1',
          ],
          [
            2,
            { size: 'md', className: 'custom-class-2' },
            'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0 custom-class-2',
          ],
          [3, { flat: true, class: 'custom-class-3' }, 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0 custom-class-3'],
          [
            4,
            { color: 'green', size: 'md', className: 'custom-class-4' },
            'bg-green-50 text-green-700 px-2 py-1 ring-0 custom-class-4',
          ],
          [
            5,
            { color: 'indigo', flat: true, class: 'custom-class-5' },
            'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0 custom-class-5',
          ],
          [
            6,
            { size: 'sm', flat: false, className: 'custom-class-6' },
            'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-1 ring-inset ring-indigo-700/10 custom-class-6',
          ],
          [
            7,
            { color: 'green', size: 'md', flat: true, class: 'custom-class-7' },
            'bg-green-50 text-green-700 px-2 py-1 ring-0 custom-class-7',
          ],
        ])('%d - badge(%o) return %o', (_, options, expected) => {
          expect(badgeWithoutBaseWithDefaults(options)).toBe(expected);
        });
      });
    });
  });

  describe('with base', () => {
    describe('without defaults', () => {
      const badgeWithBaseWithoutDefaults = cvb({
        base: badgeConfig.base,
        variants: badgeConfig.variants,
        compoundVariants: badgeConfig.compoundVariants,
      });

      type BadgeWithBaseWithoutDefaultsProps = VariantProps<typeof badgeWithBaseWithoutDefaults>;

      describe('empty parameters', () => {
        it.each<[number, BadgeWithBaseWithoutDefaultsProps, string]>([
          [
            1,
            // @ts-expect-error Invalid variant
            undefined,
            'inline-flex items-center rounded-md gap-x-1.5 text-xs',
          ],
          [2, {}, 'inline-flex items-center rounded-md gap-x-1.5 text-xs'],
          [
            3,
            { aCheekyInvalidProp: 'lol' } as BadgeWithBaseWithoutDefaultsProps,
            'inline-flex items-center rounded-md gap-x-1.5 text-xs',
          ],
        ])('%d - badge(%o) return %o', (_, options, expected) => {
          expect(badgeWithBaseWithoutDefaults(options)).toBe(expected);
        });
      });

      describe('single parameter', () => {
        describe('color only', () => {
          it.each<[number, BadgeWithBaseWithoutDefaultsProps, string]>([
            [1, { color: 'green' }, 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700'],
            [
              2,
              { color: 'indigo' },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700',
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithoutDefaults(options)).toBe(expected);
          });
        });

        describe('size only', () => {
          it.each<[number, BadgeWithBaseWithoutDefaultsProps, string]>([
            [1, { size: 'sm' }, 'inline-flex items-center rounded-md gap-x-1.5 text-xs px-1.5 py-0.5'],
            [2, { size: 'md' }, 'inline-flex items-center rounded-md gap-x-1.5 text-xs px-2 py-1'],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithoutDefaults(options)).toBe(expected);
          });
        });

        describe('flat only', () => {
          it.each<[number, BadgeWithBaseWithoutDefaultsProps, string]>([
            [1, { flat: true }, 'inline-flex items-center rounded-md gap-x-1.5 text-xs ring-0'],
            [2, { flat: false }, 'inline-flex items-center rounded-md gap-x-1.5 text-xs ring-1 ring-inset'],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithoutDefaults(options)).toBe(expected);
          });
        });
      });

      describe('two parameters', () => {
        describe('color + size combinations', () => {
          it.each<[number, BadgeWithBaseWithoutDefaultsProps, string]>([
            [
              1,
              { color: 'green', size: 'sm' },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-1.5 py-0.5',
            ],
            [
              2,
              { color: 'green', size: 'md' },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1',
            ],
            [
              3,
              { color: 'indigo', size: 'sm' },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5',
            ],
            [
              4,
              { color: 'indigo', size: 'md' },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1',
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithoutDefaults(options)).toBe(expected);
          });
        });

        describe('color + flat combinations', () => {
          it.each<[number, BadgeWithBaseWithoutDefaultsProps, string]>([
            [
              1,
              { color: 'green', flat: true },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 ring-0',
            ],
            [
              2,
              { color: 'green', flat: false },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
            ],
            [
              3,
              { color: 'indigo', flat: true },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 ring-0',
            ],
            [
              4,
              { color: 'indigo', flat: false },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10',
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithoutDefaults(options)).toBe(expected);
          });
        });

        describe('size + flat combinations', () => {
          it.each<[number, BadgeWithBaseWithoutDefaultsProps, string]>([
            [
              1,
              { size: 'sm', flat: true },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs px-1.5 py-0.5 ring-0',
            ],
            [
              2,
              { size: 'sm', flat: false },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs px-1.5 py-0.5 ring-1 ring-inset',
            ],
            [3, { size: 'md', flat: true }, 'inline-flex items-center rounded-md gap-x-1.5 text-xs px-2 py-1 ring-0'],
            [
              4,
              { size: 'md', flat: false },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs px-2 py-1 ring-1 ring-inset',
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithoutDefaults(options)).toBe(expected);
          });
        });
      });

      describe('three parameters', () => {
        describe('color + size + flat combinations', () => {
          it.each<[number, BadgeWithBaseWithoutDefaultsProps, string]>([
            [
              1,
              { color: 'green', size: 'sm', flat: true },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-1.5 py-0.5 ring-0',
            ],
            [
              2,
              { color: 'green', size: 'sm', flat: false },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-1.5 py-0.5 ring-1 ring-inset ring-green-600/20',
            ],
            [
              3,
              { color: 'green', size: 'md', flat: true },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0',
            ],
            [
              4,
              { color: 'green', size: 'md', flat: false },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-1 ring-inset ring-green-600/20',
            ],
            [
              5,
              { color: 'indigo', size: 'sm', flat: true },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0',
            ],
            [
              6,
              { color: 'indigo', size: 'sm', flat: false },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-1 ring-inset ring-indigo-700/10',
            ],
            [
              7,
              { color: 'indigo', size: 'md', flat: true },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
            ],
            [
              8,
              { color: 'indigo', size: 'md', flat: false },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10',
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithoutDefaults(options)).toBe(expected);
          });
        });
      });

      describe('handle overrides with class or className', () => {
        it.each<[number, BadgeWithBaseWithoutDefaultsProps, string]>([
          [
            1,
            { color: 'green', class: 'custom-class-1' },
            'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 custom-class-1',
          ],
          [
            2,
            { size: 'md', className: 'custom-class-2' },
            'inline-flex items-center rounded-md gap-x-1.5 text-xs px-2 py-1 custom-class-2',
          ],
          [
            3,
            { flat: true, class: 'custom-class-3' },
            'inline-flex items-center rounded-md gap-x-1.5 text-xs ring-0 custom-class-3',
          ],
          [
            4,
            { color: 'green', size: 'md', className: 'custom-class-4' },
            'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 custom-class-4',
          ],
          [
            5,
            { color: 'indigo', flat: true, class: 'custom-class-5' },
            'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 ring-0 custom-class-5',
          ],
          [
            6,
            { size: 'sm', flat: false, className: 'custom-class-6' },
            'inline-flex items-center rounded-md gap-x-1.5 text-xs px-1.5 py-0.5 ring-1 ring-inset custom-class-6',
          ],
          [
            7,
            { color: 'green', size: 'md', flat: true, class: 'custom-class-7' },
            'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0 custom-class-7',
          ],
        ])('%d - badge(%o) return %o', (_, options, expected) => {
          expect(badgeWithBaseWithoutDefaults(options)).toBe(expected);
        });
      });
    });

    describe('with defaults', () => {
      const badgeWithBaseWithDefaults = cvb({
        base: badgeConfig.base,
        variants: badgeConfig.variants,
        compoundVariants: [
          ...badgeConfig.compoundVariants,
          {
            color: ['indigo', 'green'],
            flat: false,
            className: 'uppercase',
          },
        ],
        defaultVariants: badgeConfig.defaultVariants,
      });

      type BadgeWithBaseWithDefaultsProps = VariantProps<typeof badgeWithBaseWithDefaults>;

      describe('empty parameters', () => {
        it.each<[number, BadgeWithBaseWithDefaultsProps, string]>([
          [
            1,
            // @ts-expect-error Invalid variant
            undefined,
            'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
          ],
          [
            2,
            {},
            'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
          ],
          [
            3,
            { aCheekyInvalidProp: 'lol' } as BadgeWithBaseWithDefaultsProps,
            'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
          ],
        ])('%d - badge(%o) return %o', (_, options, expected) => {
          expect(badgeWithBaseWithDefaults(options)).toBe(expected);
        });
      });

      describe('single parameter', () => {
        describe('color only', () => {
          it.each<[number, BadgeWithBaseWithDefaultsProps, string]>([
            [
              1,
              { color: 'green' },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0',
            ],
            [
              2,
              { color: 'indigo' },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithDefaults(options)).toBe(expected);
          });
        });

        describe('size only', () => {
          it.each<[number, BadgeWithBaseWithDefaultsProps, string]>([
            [
              1,
              { size: 'sm' },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0',
            ],
            [
              2,
              { size: 'md' },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithDefaults(options)).toBe(expected);
          });
        });

        describe('flat only', () => {
          it.each<[number, BadgeWithBaseWithDefaultsProps, string]>([
            [
              1,
              { flat: true },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
            ],
            [
              2,
              { flat: false },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10 uppercase',
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithDefaults(options)).toBe(expected);
          });
        });
      });

      describe('two parameters', () => {
        describe('color + size combinations', () => {
          it.each<[number, BadgeWithBaseWithDefaultsProps, string]>([
            [
              1,
              { color: 'green', size: 'sm' },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-1.5 py-0.5 ring-0',
            ],
            [
              2,
              { color: 'green', size: 'md' },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0',
            ],
            [
              3,
              { color: 'indigo', size: 'sm' },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0',
            ],
            [
              4,
              { color: 'indigo', size: 'md' },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithDefaults(options)).toBe(expected);
          });
        });

        describe('color + flat combinations', () => {
          it.each<[number, BadgeWithBaseWithDefaultsProps, string]>([
            [
              1,
              { color: 'green', flat: true },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0',
            ],
            [
              2,
              { color: 'green', flat: false },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-1 ring-inset ring-green-600/20 uppercase',
            ],
            [
              3,
              { color: 'indigo', flat: true },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
            ],
            [
              4,
              { color: 'indigo', flat: false },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10 uppercase',
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithDefaults(options)).toBe(expected);
          });
        });

        describe('size + flat combinations', () => {
          it.each<[number, BadgeWithBaseWithDefaultsProps, string]>([
            [
              1,
              { size: 'sm', flat: true },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0',
            ],
            [
              2,
              { size: 'sm', flat: false },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-1 ring-inset ring-indigo-700/10 uppercase',
            ],
            [
              3,
              { size: 'md', flat: true },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
            ],
            [
              4,
              { size: 'md', flat: false },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10 uppercase',
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithDefaults(options)).toBe(expected);
          });
        });
      });

      describe('three parameters', () => {
        describe('color + size + flat combinations', () => {
          it.each<[number, BadgeWithBaseWithDefaultsProps, string]>([
            [
              1,
              { color: 'green', size: 'sm', flat: true },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-1.5 py-0.5 ring-0',
            ],
            [
              2,
              { color: 'green', size: 'sm', flat: false },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-1.5 py-0.5 ring-1 ring-inset ring-green-600/20 uppercase',
            ],
            [
              3,
              { color: 'green', size: 'md', flat: true },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0',
            ],
            [
              4,
              { color: 'green', size: 'md', flat: false },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-1 ring-inset ring-green-600/20 uppercase',
            ],
            [
              5,
              { color: 'indigo', size: 'sm', flat: true },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0',
            ],
            [
              6,
              { color: 'indigo', size: 'sm', flat: false },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-1 ring-inset ring-indigo-700/10 uppercase',
            ],
            [
              7,
              { color: 'indigo', size: 'md', flat: true },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
            ],
            [
              8,
              { color: 'indigo', size: 'md', flat: false },
              'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10 uppercase',
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithDefaults(options)).toBe(expected);
          });
        });
      });

      describe('handle overrides with class or className', () => {
        it.each<[number, BadgeWithBaseWithDefaultsProps, string]>([
          [
            1,
            { color: 'green', class: 'custom-class-1' },
            'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0 custom-class-1',
          ],
          [
            2,
            { size: 'md', className: 'custom-class-2' },
            'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0 custom-class-2',
          ],
          [
            3,
            { flat: true, class: 'custom-class-3' },
            'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0 custom-class-3',
          ],
          [
            4,
            { color: 'green', size: 'md', className: 'custom-class-4' },
            'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0 custom-class-4',
          ],
          [
            5,
            { color: 'indigo', flat: true, class: 'custom-class-5' },
            'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0 custom-class-5',
          ],
          [
            6,
            { size: 'sm', flat: false, className: 'custom-class-6' },
            'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-1 ring-inset ring-indigo-700/10 uppercase custom-class-6',
          ],
          [
            7,
            { color: 'green', size: 'md', flat: true, class: 'custom-class-7' },
            'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0 custom-class-7',
          ],
        ])('%d - badge(%o) return %o', (_, options, expected) => {
          expect(badgeWithBaseWithDefaults(options)).toBe(expected);
        });
      });
    });
  });
});
