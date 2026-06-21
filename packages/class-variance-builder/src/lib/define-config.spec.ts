import { cvb, defineConfig } from './cvb.js';

describe('defineConfig', () => {
  describe('hooks', () => {
    describe('onComplete', () => {
      const PREFIX = 'never-gonna-give-you-up';
      const SUFFIX = 'never-gonna-let-you-down';

      const onCompleteHandler = (className: string) => [PREFIX, className, SUFFIX].join(' ');

      it('should extend compose', () => {
        const { compose: composeExtended } = defineConfig({
          hooks: {
            onComplete: onCompleteHandler,
          },
        });

        const box = cvb({
          variants: {
            shadow: {
              sm: 'shadow-sm',
              md: 'shadow-md',
            },
          },
          defaultVariants: {
            shadow: 'sm',
          },
        });
        const stack = cvb({
          variants: {
            gap: {
              unset: null,
              1: 'gap-1',
              2: 'gap-2',
              3: 'gap-3',
            },
          },
          defaultVariants: {
            gap: 'unset',
          },
        });
        const card = composeExtended(box, stack);

        expectTypeOf(card).toBeFunction();

        const cardClassList = card();
        const cardClassListSplit = cardClassList.split(' ');
        expect(cardClassListSplit[0]).toBe(PREFIX);
        expect(cardClassListSplit[cardClassListSplit.length - 1]).toBe(SUFFIX);

        const cardShadowGapClassList = card({ shadow: 'md', gap: 3 });
        const cardShadowGapClassListSplit = cardShadowGapClassList.split(' ');
        expect(cardShadowGapClassListSplit[0]).toBe(PREFIX);
        expect(cardShadowGapClassListSplit[cardShadowGapClassListSplit.length - 1]).toBe(SUFFIX);
      });

      it('should extend cvb', () => {
        const { cvb: cvbExtended } = defineConfig({
          hooks: {
            onComplete: onCompleteHandler,
          },
        });

        const component = cvbExtended({
          base: 'foo',
          variants: { intent: { primary: 'bar' } },
        });
        const componentClassList = component({ intent: 'primary' });
        const componentClassListSplit = componentClassList.split(' ');

        expectTypeOf(component).toBeFunction();
        expect(componentClassListSplit[0]).toBe(PREFIX);
        expect(componentClassListSplit[componentClassListSplit.length - 1]).toBe(SUFFIX);
      });

      test('should extend cx', () => {
        const { cx: cxExtended } = defineConfig({
          hooks: {
            onComplete: onCompleteHandler,
          },
        });

        const classList = cxExtended('foo', 'bar');
        const classListSplit = classList.split(' ');

        expectTypeOf(classList).toBeString();
        expect(classListSplit[0]).toBe(PREFIX);
        expect(classListSplit[classListSplit.length - 1]).toBe(SUFFIX);
      });
    });
  });
});
