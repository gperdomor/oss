import type { Compose, CX, DefineConfig, RecipeCreatorFn, SlotRecipeCreatorFn, SlotRecord } from './types.js';
import {
  getCompoundVariantClassNames,
  getCompoundVariantClassNamesBySlot,
  getVariantClassNames,
  getVariantClassNamesBySlot,
  mergeDefaultsAndProps,
} from './utils.js';

const cxInternal: CX = (...inputs) => {
  let str = '',
    i = 0,
    arg: unknown;

  for (; i < inputs.length; ) {
    if ((arg = inputs[i++]) && typeof arg === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      str && (str += ' ');
      str += arg;
    }
  }
  return str;
};

export const defineConfig: DefineConfig = (options) => {
  const cx: CX = (...inputs) => {
    if (typeof options?.hooks?.onComplete === 'function') {
      return options.hooks.onComplete(cxInternal(...inputs));
    }

    return cxInternal(...inputs);
  };

  const cvb: RecipeCreatorFn = (config) => {
    const { base, variants, compoundVariants = [], defaultVariants = {} } = config ?? {};

    if (variants === undefined) {
      return (props) => cx(base, props?.class ?? props?.className);
    }

    return (props) => {
      const variantClassNames = getVariantClassNames(props, variants, defaultVariants);
      const compoundVariantClassNames = getCompoundVariantClassNames(
        compoundVariants,
        mergeDefaultsAndProps(props, defaultVariants),
      );

      return cx(base, variantClassNames, compoundVariantClassNames, props?.class ?? props?.className);
    };
  };

  const svb: SlotRecipeCreatorFn = (config) => {
    const { slots = [], base, variants = {}, compoundVariants = [], defaultVariants = {} } = config ?? {};

    return (props) => {
      const obj: SlotRecord<string, string> = {};
      const { class: _class, className, ...propsWithoutClass } = props ?? {};

      for (const slotKey of slots) {
        obj[slotKey] = cx(
          base?.[slotKey],
          getVariantClassNamesBySlot(propsWithoutClass, slotKey, variants, defaultVariants),
          getCompoundVariantClassNamesBySlot(
            slotKey,
            compoundVariants,
            mergeDefaultsAndProps(propsWithoutClass, defaultVariants),
          ),
          _class?.[slotKey] ?? className?.[slotKey],
        );
      }
      return obj;
    };
  };

  const compose: Compose =
    (...components) =>
    (props) => {
      const { class: _class, className, ...propsWithoutClass } = props ?? {};

      return cx(...components.map((component) => component(propsWithoutClass)), _class ?? className);
    };

  return {
    compose,
    cvb,
    svb,
    cx,
  };
};

export const { compose, cvb, svb, cx } = defineConfig();
