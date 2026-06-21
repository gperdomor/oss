import { svb } from './cvb.js';
import { SlotRecipeDefinition, VariantProps } from './types.js';

describe('svb', () => {
  const badgeConfig: Required<SlotRecipeDefinition> = {
    slots: ['root', 'dot'],
    base: {
      root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs',
      dot: '',
    },
    variants: {
      color: {
        green: {
          root: 'bg-green-50 text-green-700',
          dot: 'fill-green-500',
        },
        indigo: {
          root: 'bg-indigo-50 text-indigo-700',
          dot: 'fill-indigo-500',
        },
      },
      size: {
        sm: {
          root: 'px-1.5 py-0.5',
          dot: 'size-1.5',
        },
        md: { root: 'px-2 py-1', dot: 'size-2' },
      },
      flat: {
        true: { root: 'ring-0' },
        false: { root: 'ring-1 ring-inset' },
      },
    },
    compoundVariants: [
      {
        color: 'green',
        flat: false,
        class: { root: 'ring-green-600/20' }, // You can also use "className"
      },
      {
        color: 'indigo',
        flat: false,
        className: { root: 'ring-indigo-700/10' }, // You can also use "className"
      },
    ],
    defaultVariants: {
      color: 'indigo',
      flat: true,
      size: 'md',
    },
  };

  describe('without anything', () => {
    it('empty', () => {
      const example = svb({ slots: [], variants: {} });
      expect(example()).toEqual({});
      expect(
        example({
          // @ts-expect-error: This is not a valid variant and should be ignored
          aCheekyInvalidProp: 'lol',
        }),
      ).toEqual({});
      expect(example({ class: 'adhoc-class' })).toEqual({});
      expect(example({ className: 'adhoc-className' })).toEqual({});
      expect(
        example({
          class: 'adhoc-class',
          // @ts-expect-error: Only one of class or className is allowed, with class taking precedence
          className: 'adhoc-className',
        }),
      ).toEqual({});
    });

    it('only with slots', () => {
      const example = svb({ slots: ['root', 'dot'], variants: {} });
      expect(example()).toEqual({
        root: '',
        dot: '',
      });
      expect(
        example({
          // @ts-expect-error: This is not a valid variant and should be ignored
          aCheekyInvalidProp: 'lol',
        }),
      ).toEqual({
        root: '',
        dot: '',
      });
      expect(example({ class: { root: 'adhoc-root-class', dot: 'adhoc-dot-class' } })).toEqual({
        root: 'adhoc-root-class',
        dot: 'adhoc-dot-class',
      });
      expect(example({ className: { root: 'adhoc-root-className', dot: 'adhoc-dot-class' } })).toEqual({
        root: 'adhoc-root-className',
        dot: 'adhoc-dot-class',
      });
      expect(
        example({
          class: { root: 'adhoc-root-class', dot: 'adhoc-dot-class' },
          // @ts-expect-error: Only one of class or className is allowed, with class taking precedence
          className: { root: 'adhoc-root-classname', control: 'adhoc-dot-classname' },
        }),
      ).toEqual({
        root: 'adhoc-root-class',
        dot: 'adhoc-dot-class',
      });
    });

    it('undefined', () => {
      // @ts-expect-error props is invalid
      const example = svb(undefined);
      expect(example()).toEqual({});
      expect(
        example({
          aCheekyInvalidProp: 'lol',
        }),
      ).toEqual({});
      expect(example({ class: { root: 'adhoc-class' } })).toEqual({});
      expect(example({ className: { root: 'adhoc-className' } })).toEqual({});
      expect(
        example({
          className: { root: 'adhoc-className' },
        }),
      ).toEqual({});
    });

    it('null', () => {
      // @ts-expect-error props is invalid
      const example = svb(null);
      expect(example()).toEqual({});
      expect(
        example({
          aCheekyInvalidProp: 'lol',
        }),
      ).toEqual({});
      expect(example({ class: { root: 'adhoc-class' } })).toEqual({});
      expect(example({ className: { root: 'adhoc-className' } })).toEqual({});
      expect(
        example({
          class: { root: 'adhoc-class' },
          // @ts-expect-error: Only one of class or className is allowed, with class taking precedence
          className: { root: 'adhoc-className' },
        }),
      ).toEqual({});
    });
  });

  describe('without base', () => {
    describe('without defaults', () => {
      const badgeWithoutBaseWithoutDefaults = svb({
        slots: badgeConfig.slots,
        variants: badgeConfig.variants,
        compoundVariants: badgeConfig.compoundVariants,
      });

      type BadgeWithoutBaseWithoutDefaultsProps = VariantProps<typeof badgeWithoutBaseWithoutDefaults>;

      describe('empty parameters', () => {
        it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, Record<string, string>]>([
          [
            1,
            // @ts-expect-error Invalid variant
            undefined,
            { root: '', dot: '' },
          ],
          [2, {}, { root: '', dot: '' }],
          [3, { aCheekyInvalidProp: 'lol' } as BadgeWithoutBaseWithoutDefaultsProps, { root: '', dot: '' }],
        ])('%d - badge(%o) return %o', (_, options, expected) => {
          expect(badgeWithoutBaseWithoutDefaults(options)).toEqual(expected);
        });
      });

      describe('single parameter', () => {
        describe('color only', () => {
          it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, Record<string, string>]>([
            [1, { color: 'green' }, { root: 'bg-green-50 text-green-700', dot: 'fill-green-500' }],
            [2, { color: 'indigo' }, { root: 'bg-indigo-50 text-indigo-700', dot: 'fill-indigo-500' }],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithoutDefaults(options)).toEqual(expected);
          });
        });

        describe('size only', () => {
          it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, Record<string, string>]>([
            [1, { size: 'sm' }, { root: 'px-1.5 py-0.5', dot: 'size-1.5' }],
            [2, { size: 'md' }, { root: 'px-2 py-1', dot: 'size-2' }],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithoutDefaults(options)).toEqual(expected);
          });
        });

        describe('flat only', () => {
          it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, Record<string, string>]>([
            [1, { flat: true }, { root: 'ring-0', dot: '' }],
            [2, { flat: false }, { root: 'ring-1 ring-inset', dot: '' }],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithoutDefaults(options)).toEqual(expected);
          });
        });
      });

      describe('two parameters', () => {
        describe('color + size combinations', () => {
          it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, Record<string, string>]>([
            [
              1,
              { color: 'green', size: 'sm' },
              {
                root: 'bg-green-50 text-green-700 px-1.5 py-0.5',
                dot: 'fill-green-500 size-1.5',
              },
            ],
            [
              2,
              { color: 'green', size: 'md' },
              { root: 'bg-green-50 text-green-700 px-2 py-1', dot: 'fill-green-500 size-2' },
            ],
            [
              3,
              { color: 'indigo', size: 'sm' },
              { root: 'bg-indigo-50 text-indigo-700 px-1.5 py-0.5', dot: 'fill-indigo-500 size-1.5' },
            ],
            [
              4,
              { color: 'indigo', size: 'md' },
              { root: 'bg-indigo-50 text-indigo-700 px-2 py-1', dot: 'fill-indigo-500 size-2' },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithoutDefaults(options)).toEqual(expected);
          });
        });

        describe('color + flat combinations', () => {
          it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, Record<string, string>]>([
            [1, { color: 'green', flat: true }, { root: 'bg-green-50 text-green-700 ring-0', dot: 'fill-green-500' }],
            [
              2,
              { color: 'green', flat: false },
              { root: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20', dot: 'fill-green-500' },
            ],
            [
              3,
              { color: 'indigo', flat: true },
              { root: 'bg-indigo-50 text-indigo-700 ring-0', dot: 'fill-indigo-500' },
            ],
            [
              4,
              { color: 'indigo', flat: false },
              { root: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10', dot: 'fill-indigo-500' },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithoutDefaults(options)).toEqual(expected);
          });
        });

        describe('size + flat combinations', () => {
          it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, Record<string, string>]>([
            [1, { size: 'sm', flat: true }, { root: 'px-1.5 py-0.5 ring-0', dot: 'size-1.5' }],
            [2, { size: 'sm', flat: false }, { root: 'px-1.5 py-0.5 ring-1 ring-inset', dot: 'size-1.5' }],
            [3, { size: 'md', flat: true }, { root: 'px-2 py-1 ring-0', dot: 'size-2' }],
            [4, { size: 'md', flat: false }, { root: 'px-2 py-1 ring-1 ring-inset', dot: 'size-2' }],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithoutDefaults(options)).toEqual(expected);
          });
        });
      });

      describe('three parameters', () => {
        describe('color + size + flat combinations', () => {
          it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, Record<string, string>]>([
            [
              1,
              { color: 'green', size: 'sm', flat: true },
              { root: 'bg-green-50 text-green-700 px-1.5 py-0.5 ring-0', dot: 'fill-green-500 size-1.5' },
            ],
            [
              2,
              { color: 'green', size: 'sm', flat: false },
              {
                root: 'bg-green-50 text-green-700 px-1.5 py-0.5 ring-1 ring-inset ring-green-600/20',
                dot: 'fill-green-500 size-1.5',
              },
            ],
            [
              3,
              { color: 'green', size: 'md', flat: true },
              { root: 'bg-green-50 text-green-700 px-2 py-1 ring-0', dot: 'fill-green-500 size-2' },
            ],
            [
              4,
              { color: 'green', size: 'md', flat: false },
              {
                root: 'bg-green-50 text-green-700 px-2 py-1 ring-1 ring-inset ring-green-600/20',
                dot: 'fill-green-500 size-2',
              },
            ],
            [
              5,
              { color: 'indigo', size: 'sm', flat: true },
              { root: 'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0', dot: 'fill-indigo-500 size-1.5' },
            ],
            [
              6,
              { color: 'indigo', size: 'sm', flat: false },
              {
                root: 'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-1 ring-inset ring-indigo-700/10',
                dot: 'fill-indigo-500 size-1.5',
              },
            ],
            [
              7,
              { color: 'indigo', size: 'md', flat: true },
              { root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0', dot: 'fill-indigo-500 size-2' },
            ],
            [
              8,
              { color: 'indigo', size: 'md', flat: false },
              {
                root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10',
                dot: 'fill-indigo-500 size-2',
              },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithoutDefaults(options)).toEqual(expected);
          });
        });
      });

      describe('handle overrides with class or className', () => {
        it.each<[number, BadgeWithoutBaseWithoutDefaultsProps, Record<string, string>]>([
          [
            1,
            { color: 'green', class: { root: 'custom-root-1', dot: 'custom-dot-1' } },
            { root: 'bg-green-50 text-green-700 custom-root-1', dot: 'fill-green-500 custom-dot-1' },
          ],
          [2, { size: 'md', className: { root: 'custom-root-2' } }, { root: 'px-2 py-1 custom-root-2', dot: 'size-2' }],
          [3, { flat: true, class: { root: 'custom-root-3' } }, { root: 'ring-0 custom-root-3', dot: '' }],
          [
            4,
            { color: 'green', size: 'md', className: { root: 'custom-root-4', dot: 'custom-dot-4' } },
            { root: 'bg-green-50 text-green-700 px-2 py-1 custom-root-4', dot: 'fill-green-500 size-2 custom-dot-4' },
          ],
          [
            5,
            { color: 'indigo', flat: true, class: { root: 'custom-root-5' } },
            { root: 'bg-indigo-50 text-indigo-700 ring-0 custom-root-5', dot: 'fill-indigo-500' },
          ],
          [
            6,
            { size: 'sm', flat: false, className: { root: 'custom-root-6' } },
            { root: 'px-1.5 py-0.5 ring-1 ring-inset custom-root-6', dot: 'size-1.5' },
          ],
          [
            7,
            { color: 'green', size: 'md', flat: true, class: { root: 'custom-root-7' } },
            { root: 'bg-green-50 text-green-700 px-2 py-1 ring-0 custom-root-7', dot: 'fill-green-500 size-2' },
          ],
        ])('%d - badge(%o) return %o', (_, options, expected) => {
          expect(badgeWithoutBaseWithoutDefaults(options)).toEqual(expected);
        });
      });
    });

    describe('with defaults', () => {
      const badgeWithoutBaseWithDefaults = svb({
        slots: badgeConfig.slots,
        variants: badgeConfig.variants,
        compoundVariants: badgeConfig.compoundVariants,
        defaultVariants: badgeConfig.defaultVariants,
      });

      type BadgeWithoutBaseWithDefaultsProps = VariantProps<typeof badgeWithoutBaseWithDefaults>;

      describe('empty parameters', () => {
        it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
          [
            1,
            // @ts-expect-error Invalid variant
            undefined,
            { root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0', dot: 'fill-indigo-500 size-2' },
          ],
          [2, {}, { root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0', dot: 'fill-indigo-500 size-2' }],
          [
            3,
            { aCheekyInvalidProp: 'lol' } as BadgeWithoutBaseWithDefaultsProps,
            { root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0', dot: 'fill-indigo-500 size-2' },
          ],
        ])('%d - badge(%o) return %o', (_, options, expected) => {
          expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
        });
      });

      describe('single parameter', () => {
        describe('color only', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
            [
              1,
              { color: 'green' },
              { root: 'bg-green-50 text-green-700 px-2 py-1 ring-0', dot: 'fill-green-500 size-2' },
            ],
            [
              2,
              { color: 'indigo' },
              { root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0', dot: 'fill-indigo-500 size-2' },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
          });
        });

        describe('size only', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
            [
              1,
              { size: 'sm' },
              { root: 'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0', dot: 'fill-indigo-500 size-1.5' },
            ],
            [
              2,
              { size: 'md' },
              { root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0', dot: 'fill-indigo-500 size-2' },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
          });
        });

        describe('flat only', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
            [
              1,
              { flat: true },
              { root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0', dot: 'fill-indigo-500 size-2' },
            ],
            [
              2,
              { flat: false },
              {
                root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10',
                dot: 'fill-indigo-500 size-2',
              },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
          });
        });
      });

      describe('two parameters', () => {
        describe('color + size combinations', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
            [
              1,
              { color: 'green', size: 'sm' },
              { root: 'bg-green-50 text-green-700 px-1.5 py-0.5 ring-0', dot: 'fill-green-500 size-1.5' },
            ],
            [
              2,
              { color: 'green', size: 'md' },
              { root: 'bg-green-50 text-green-700 px-2 py-1 ring-0', dot: 'fill-green-500 size-2' },
            ],
            [
              3,
              { color: 'indigo', size: 'sm' },
              { root: 'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0', dot: 'fill-indigo-500 size-1.5' },
            ],
            [
              4,
              { color: 'indigo', size: 'md' },
              { root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0', dot: 'fill-indigo-500 size-2' },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
          });
        });

        describe('color + flat combinations', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
            [
              1,
              { color: 'green', flat: true },
              { root: 'bg-green-50 text-green-700 px-2 py-1 ring-0', dot: 'fill-green-500 size-2' },
            ],
            [
              2,
              { color: 'green', flat: false },
              {
                root: 'bg-green-50 text-green-700 px-2 py-1 ring-1 ring-inset ring-green-600/20',
                dot: 'fill-green-500 size-2',
              },
            ],
            [
              3,
              { color: 'indigo', flat: true },
              { root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0', dot: 'fill-indigo-500 size-2' },
            ],
            [
              4,
              { color: 'indigo', flat: false },
              {
                root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10',
                dot: 'fill-indigo-500 size-2',
              },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
          });
        });

        describe('size + flat combinations', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
            [
              1,
              { size: 'sm', flat: true },
              { root: 'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0', dot: 'fill-indigo-500 size-1.5' },
            ],
            [
              2,
              { size: 'sm', flat: false },
              {
                root: 'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-1 ring-inset ring-indigo-700/10',
                dot: 'fill-indigo-500 size-1.5',
              },
            ],
            [
              3,
              { size: 'md', flat: true },
              { root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0', dot: 'fill-indigo-500 size-2' },
            ],
            [
              4,
              { size: 'md', flat: false },
              {
                root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10',
                dot: 'fill-indigo-500 size-2',
              },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
          });
        });
      });

      describe('three parameters', () => {
        describe('color + size + flat combinations', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
            [
              1,
              { color: 'green', size: 'sm', flat: true },
              { root: 'bg-green-50 text-green-700 px-1.5 py-0.5 ring-0', dot: 'fill-green-500 size-1.5' },
            ],
            [
              2,
              { color: 'green', size: 'sm', flat: false },
              {
                root: 'bg-green-50 text-green-700 px-1.5 py-0.5 ring-1 ring-inset ring-green-600/20',
                dot: 'fill-green-500 size-1.5',
              },
            ],
            [
              3,
              { color: 'green', size: 'md', flat: true },
              { root: 'bg-green-50 text-green-700 px-2 py-1 ring-0', dot: 'fill-green-500 size-2' },
            ],
            [
              4,
              { color: 'green', size: 'md', flat: false },
              {
                root: 'bg-green-50 text-green-700 px-2 py-1 ring-1 ring-inset ring-green-600/20',
                dot: 'fill-green-500 size-2',
              },
            ],
            [
              5,
              { color: 'indigo', size: 'sm', flat: true },
              { root: 'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0', dot: 'fill-indigo-500 size-1.5' },
            ],
            [
              6,
              { color: 'indigo', size: 'sm', flat: false },
              {
                root: 'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-1 ring-inset ring-indigo-700/10',
                dot: 'fill-indigo-500 size-1.5',
              },
            ],
            [
              7,
              { color: 'indigo', size: 'md', flat: true },
              { root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0', dot: 'fill-indigo-500 size-2' },
            ],
            [
              8,
              { color: 'indigo', size: 'md', flat: false },
              {
                root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10',
                dot: 'fill-indigo-500 size-2',
              },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
          });
        });
      });

      describe('handle overrides with class or className', () => {
        it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
          [
            1,
            { color: 'green', class: { root: 'custom-root-1', dot: 'custom-dot-1' } },
            {
              root: 'bg-green-50 text-green-700 px-2 py-1 ring-0 custom-root-1',
              dot: 'fill-green-500 size-2 custom-dot-1',
            },
          ],
          [
            2,
            { size: 'md', className: { root: 'custom-root-2' } },
            { root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0 custom-root-2', dot: 'fill-indigo-500 size-2' },
          ],
          [
            3,
            { flat: true, class: { root: 'custom-root-3' } },
            { root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0 custom-root-3', dot: 'fill-indigo-500 size-2' },
          ],
          [
            4,
            { color: 'green', size: 'md', className: { root: 'custom-root-4', dot: 'custom-dot-4' } },
            {
              root: 'bg-green-50 text-green-700 px-2 py-1 ring-0 custom-root-4',
              dot: 'fill-green-500 size-2 custom-dot-4',
            },
          ],
          [
            5,
            { color: 'indigo', flat: true, class: { root: 'custom-root-5' } },
            { root: 'bg-indigo-50 text-indigo-700 px-2 py-1 ring-0 custom-root-5', dot: 'fill-indigo-500 size-2' },
          ],
          [
            6,
            { size: 'sm', flat: false, className: { root: 'custom-root-6' } },
            {
              root: 'bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-1 ring-inset ring-indigo-700/10 custom-root-6',
              dot: 'fill-indigo-500 size-1.5',
            },
          ],
          [
            7,
            { color: 'green', size: 'md', flat: true, class: { root: 'custom-root-7' } },
            { root: 'bg-green-50 text-green-700 px-2 py-1 ring-0 custom-root-7', dot: 'fill-green-500 size-2' },
          ],
        ])('%d - badge(%o) return %o', (_, options, expected) => {
          expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
        });
      });
    });
  });

  describe('with base', () => {
    describe('without defaults', () => {
      const badgeWithBaseWithoutDefaults = svb({
        slots: badgeConfig.slots,
        base: badgeConfig.base,
        variants: badgeConfig.variants,
        compoundVariants: badgeConfig.compoundVariants,
      });

      type BadgeWithBaseWithoutDefaultsProps = VariantProps<typeof badgeWithBaseWithoutDefaults>;

      describe('empty parameters', () => {
        it.each<[number, BadgeWithBaseWithoutDefaultsProps, Record<string, string>]>([
          [
            1,
            // @ts-expect-error Invalid variant
            undefined,
            { root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs', dot: '' },
          ],
          [2, {}, { root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs', dot: '' }],
          [
            3,
            { aCheekyInvalidProp: 'lol' } as BadgeWithBaseWithoutDefaultsProps,
            { root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs', dot: '' },
          ],
        ])('%d - badge(%o) return %o', (_, options, expected) => {
          expect(badgeWithBaseWithoutDefaults(options)).toEqual(expected);
        });
      });

      describe('single parameter', () => {
        describe('color only', () => {
          it.each<[number, BadgeWithBaseWithoutDefaultsProps, Record<string, string>]>([
            [
              1,
              { color: 'green' },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700',
                dot: 'fill-green-500',
              },
            ],
            [
              2,
              { color: 'indigo' },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700',
                dot: 'fill-indigo-500',
              },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithoutDefaults(options)).toEqual(expected);
          });
        });

        describe('size only', () => {
          it.each<[number, BadgeWithBaseWithoutDefaultsProps, Record<string, string>]>([
            [
              1,
              { size: 'sm' },
              { root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs px-1.5 py-0.5', dot: 'size-1.5' },
            ],
            [
              2,
              { size: 'md' },
              { root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs px-2 py-1', dot: 'size-2' },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithoutDefaults(options)).toEqual(expected);
          });
        });

        describe('flat only', () => {
          it.each<[number, BadgeWithBaseWithoutDefaultsProps, Record<string, string>]>([
            [1, { flat: true }, { root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs ring-0', dot: '' }],
            [
              2,
              { flat: false },
              { root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs ring-1 ring-inset', dot: '' },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithoutDefaults(options)).toEqual(expected);
          });
        });
      });

      describe('two parameters', () => {
        describe('color + size combinations', () => {
          it.each<[number, BadgeWithBaseWithoutDefaultsProps, Record<string, string>]>([
            [
              1,
              { color: 'green', size: 'sm' },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-1.5 py-0.5',
                dot: 'fill-green-500 size-1.5',
              },
            ],
            [
              2,
              { color: 'green', size: 'md' },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1',
                dot: 'fill-green-500 size-2',
              },
            ],
            [
              3,
              { color: 'indigo', size: 'sm' },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5',
                dot: 'fill-indigo-500 size-1.5',
              },
            ],
            [
              4,
              { color: 'indigo', size: 'md' },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1',
                dot: 'fill-indigo-500 size-2',
              },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithoutDefaults(options)).toEqual(expected);
          });
        });

        describe('color + flat combinations', () => {
          it.each<[number, BadgeWithBaseWithoutDefaultsProps, Record<string, string>]>([
            [
              1,
              { color: 'green', flat: true },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 ring-0',
                dot: 'fill-green-500',
              },
            ],
            [
              2,
              { color: 'green', flat: false },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
                dot: 'fill-green-500',
              },
            ],
            [
              3,
              { color: 'indigo', flat: true },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 ring-0',
                dot: 'fill-indigo-500',
              },
            ],
            [
              4,
              { color: 'indigo', flat: false },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10',
                dot: 'fill-indigo-500',
              },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithoutDefaults(options)).toEqual(expected);
          });
        });

        describe('size + flat combinations', () => {
          it.each<[number, BadgeWithBaseWithoutDefaultsProps, Record<string, string>]>([
            [
              1,
              { size: 'sm', flat: true },
              { root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs px-1.5 py-0.5 ring-0', dot: 'size-1.5' },
            ],
            [
              2,
              { size: 'sm', flat: false },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs px-1.5 py-0.5 ring-1 ring-inset',
                dot: 'size-1.5',
              },
            ],
            [
              3,
              { size: 'md', flat: true },
              { root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs px-2 py-1 ring-0', dot: 'size-2' },
            ],
            [
              4,
              { size: 'md', flat: false },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs px-2 py-1 ring-1 ring-inset',
                dot: 'size-2',
              },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithoutDefaults(options)).toEqual(expected);
          });
        });
      });

      describe('three parameters', () => {
        describe('color + size + flat combinations', () => {
          it.each<[number, BadgeWithBaseWithoutDefaultsProps, Record<string, string>]>([
            [
              1,
              { color: 'green', size: 'sm', flat: true },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-1.5 py-0.5 ring-0',
                dot: 'fill-green-500 size-1.5',
              },
            ],
            [
              2,
              { color: 'green', size: 'sm', flat: false },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-1.5 py-0.5 ring-1 ring-inset ring-green-600/20',
                dot: 'fill-green-500 size-1.5',
              },
            ],
            [
              3,
              { color: 'green', size: 'md', flat: true },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0',
                dot: 'fill-green-500 size-2',
              },
            ],
            [
              4,
              { color: 'green', size: 'md', flat: false },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-1 ring-inset ring-green-600/20',
                dot: 'fill-green-500 size-2',
              },
            ],
            [
              5,
              { color: 'indigo', size: 'sm', flat: true },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0',
                dot: 'fill-indigo-500 size-1.5',
              },
            ],
            [
              6,
              { color: 'indigo', size: 'sm', flat: false },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-1 ring-inset ring-indigo-700/10',
                dot: 'fill-indigo-500 size-1.5',
              },
            ],
            [
              7,
              { color: 'indigo', size: 'md', flat: true },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
                dot: 'fill-indigo-500 size-2',
              },
            ],
            [
              8,
              { color: 'indigo', size: 'md', flat: false },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10',
                dot: 'fill-indigo-500 size-2',
              },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithBaseWithoutDefaults(options)).toEqual(expected);
          });
        });
      });

      describe('handle overrides with class or className', () => {
        it.each<[number, BadgeWithBaseWithoutDefaultsProps, Record<string, string>]>([
          [
            1,
            { color: 'green', class: { root: 'custom-root-1', dot: 'custom-dot-1' } },
            {
              root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 custom-root-1',
              dot: 'fill-green-500 custom-dot-1',
            },
          ],
          [
            2,
            { size: 'md', className: { root: 'custom-root-2' } },
            { root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs px-2 py-1 custom-root-2', dot: 'size-2' },
          ],
          [
            3,
            { flat: true, class: { root: 'custom-root-3' } },
            { root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs ring-0 custom-root-3', dot: '' },
          ],
          [
            4,
            { color: 'green', size: 'md', className: { root: 'custom-root-4', dot: 'custom-dot-4' } },
            {
              root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 custom-root-4',
              dot: 'fill-green-500 size-2 custom-dot-4',
            },
          ],
          [
            5,
            { color: 'indigo', flat: true, class: { root: 'custom-root-5' } },
            {
              root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 ring-0 custom-root-5',
              dot: 'fill-indigo-500',
            },
          ],
          [
            6,
            { size: 'sm', flat: false, className: { root: 'custom-root-6' } },
            {
              root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs px-1.5 py-0.5 ring-1 ring-inset custom-root-6',
              dot: 'size-1.5',
            },
          ],
          [
            7,
            { color: 'green', size: 'md', flat: true, class: { root: 'custom-root-7' } },
            {
              root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0 custom-root-7',
              dot: 'fill-green-500 size-2',
            },
          ],
        ])('%d - badge(%o) return %o', (_, options, expected) => {
          expect(badgeWithBaseWithoutDefaults(options)).toEqual(expected);
        });
      });
    });

    describe('with defaults', () => {
      const badgeWithoutBaseWithDefaults = svb({
        slots: badgeConfig.slots,
        base: badgeConfig.base,
        variants: badgeConfig.variants,
        compoundVariants: [
          ...badgeConfig.compoundVariants,
          {
            color: ['indigo', 'green'],
            flat: false,
            className: { root: 'uppercase' },
          },
        ],
        defaultVariants: badgeConfig.defaultVariants,
      });

      type BadgeWithoutBaseWithDefaultsProps = VariantProps<typeof badgeWithoutBaseWithDefaults>;

      describe('empty parameters', () => {
        it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
          [
            1,
            // @ts-expect-error Invalid variant
            undefined,
            {
              root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
              dot: 'fill-indigo-500 size-2',
            },
          ],
          [
            2,
            {},
            {
              root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
              dot: 'fill-indigo-500 size-2',
            },
          ],
          [
            3,
            { aCheekyInvalidProp: 'lol' } as BadgeWithoutBaseWithDefaultsProps,
            {
              root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
              dot: 'fill-indigo-500 size-2',
            },
          ],
        ])('%d - badge(%o) return %o', (_, options, expected) => {
          expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
        });
      });

      describe('single parameter', () => {
        describe('color only', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
            [
              1,
              { color: 'green' },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0',
                dot: 'fill-green-500 size-2',
              },
            ],
            [
              2,
              { color: 'indigo' },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
                dot: 'fill-indigo-500 size-2',
              },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
          });
        });

        describe('size only', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
            [
              1,
              { size: 'sm' },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0',
                dot: 'fill-indigo-500 size-1.5',
              },
            ],
            [
              2,
              { size: 'md' },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
                dot: 'fill-indigo-500 size-2',
              },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
          });
        });

        describe('flat only', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
            [
              1,
              { flat: true },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
                dot: 'fill-indigo-500 size-2',
              },
            ],
            [
              2,
              { flat: false },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10 uppercase',
                dot: 'fill-indigo-500 size-2',
              },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
          });
        });
      });

      describe('two parameters', () => {
        describe('color + size combinations', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
            [
              1,
              { color: 'green', size: 'sm' },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-1.5 py-0.5 ring-0',
                dot: 'fill-green-500 size-1.5',
              },
            ],
            [
              2,
              { color: 'green', size: 'md' },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0',
                dot: 'fill-green-500 size-2',
              },
            ],
            [
              3,
              { color: 'indigo', size: 'sm' },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0',
                dot: 'fill-indigo-500 size-1.5',
              },
            ],
            [
              4,
              { color: 'indigo', size: 'md' },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
                dot: 'fill-indigo-500 size-2',
              },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
          });
        });

        describe('color + flat combinations', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
            [
              1,
              { color: 'green', flat: true },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0',
                dot: 'fill-green-500 size-2',
              },
            ],
            [
              2,
              { color: 'green', flat: false },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-1 ring-inset ring-green-600/20 uppercase',
                dot: 'fill-green-500 size-2',
              },
            ],
            [
              3,
              { color: 'indigo', flat: true },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
                dot: 'fill-indigo-500 size-2',
              },
            ],
            [
              4,
              { color: 'indigo', flat: false },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10 uppercase',
                dot: 'fill-indigo-500 size-2',
              },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
          });
        });

        describe('size + flat combinations', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
            [
              1,
              { size: 'sm', flat: true },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0',
                dot: 'fill-indigo-500 size-1.5',
              },
            ],
            [
              2,
              { size: 'sm', flat: false },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-1 ring-inset ring-indigo-700/10 uppercase',
                dot: 'fill-indigo-500 size-1.5',
              },
            ],
            [
              3,
              { size: 'md', flat: true },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
                dot: 'fill-indigo-500 size-2',
              },
            ],
            [
              4,
              { size: 'md', flat: false },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10 uppercase',
                dot: 'fill-indigo-500 size-2',
              },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
          });
        });
      });

      describe('three parameters', () => {
        describe('color + size + flat combinations', () => {
          it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
            [
              1,
              { color: 'green', size: 'sm', flat: true },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-1.5 py-0.5 ring-0',
                dot: 'fill-green-500 size-1.5',
              },
            ],
            [
              2,
              { color: 'green', size: 'sm', flat: false },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-1.5 py-0.5 ring-1 ring-inset ring-green-600/20 uppercase',
                dot: 'fill-green-500 size-1.5',
              },
            ],
            [
              3,
              { color: 'green', size: 'md', flat: true },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0',
                dot: 'fill-green-500 size-2',
              },
            ],
            [
              4,
              { color: 'green', size: 'md', flat: false },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-1 ring-inset ring-green-600/20 uppercase',
                dot: 'fill-green-500 size-2',
              },
            ],
            [
              5,
              { color: 'indigo', size: 'sm', flat: true },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-0',
                dot: 'fill-indigo-500 size-1.5',
              },
            ],
            [
              6,
              { color: 'indigo', size: 'sm', flat: false },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-1 ring-inset ring-indigo-700/10 uppercase',
                dot: 'fill-indigo-500 size-1.5',
              },
            ],
            [
              7,
              { color: 'indigo', size: 'md', flat: true },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0',
                dot: 'fill-indigo-500 size-2',
              },
            ],
            [
              8,
              { color: 'indigo', size: 'md', flat: false },
              {
                root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-1 ring-inset ring-indigo-700/10 uppercase',
                dot: 'fill-indigo-500 size-2',
              },
            ],
          ])('%d - badge(%o) return %o', (_, options, expected) => {
            expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
          });
        });
      });

      describe('handle overrides with class or className', () => {
        it.each<[number, BadgeWithoutBaseWithDefaultsProps, Record<string, string>]>([
          [
            1,
            { color: 'green', class: { root: 'custom-root-1', dot: 'custom-dot-1' } },
            {
              root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0 custom-root-1',
              dot: 'fill-green-500 size-2 custom-dot-1',
            },
          ],
          [
            2,
            { size: 'md', className: { root: 'custom-root-2' } },
            {
              root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0 custom-root-2',
              dot: 'fill-indigo-500 size-2',
            },
          ],
          [
            3,
            { flat: true, class: { root: 'custom-root-3' } },
            {
              root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0 custom-root-3',
              dot: 'fill-indigo-500 size-2',
            },
          ],
          [
            4,
            { color: 'green', size: 'md', className: { root: 'custom-root-4', dot: 'custom-dot-4' } },
            {
              root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0 custom-root-4',
              dot: 'fill-green-500 size-2 custom-dot-4',
            },
          ],
          [
            5,
            { color: 'indigo', flat: true, class: { root: 'custom-root-5' } },
            {
              root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 ring-0 custom-root-5',
              dot: 'fill-indigo-500 size-2',
            },
          ],
          [
            6,
            { size: 'sm', flat: false, className: { root: 'custom-root-6' } },
            {
              root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 ring-1 ring-inset ring-indigo-700/10 uppercase custom-root-6',
              dot: 'fill-indigo-500 size-1.5',
            },
          ],
          [
            7,
            { color: 'green', size: 'md', flat: true, class: { root: 'custom-root-7' } },
            {
              root: 'inline-flex items-center rounded-md gap-x-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 ring-0 custom-root-7',
              dot: 'fill-green-500 size-2',
            },
          ],
        ])('%d - badge(%o) return %o', (_, options, expected) => {
          expect(badgeWithoutBaseWithDefaults(options)).toEqual(expected);
        });
      });
    });
  });
});
