import type {
  ClassDictionary,
  ClassProp,
  ClassValue,
  Pretty,
  RecipeCompoundSelection,
  RecipeCompoundVariant,
  RecipeSelection,
  RecipeVariantRecord,
  SlotRecipeCompoundVariant,
  SlotRecipeVariantRecord,
  SlotRecord,
} from './types.js';

export const isEmpty = (obj: Record<PropertyKey, any>): boolean => Object.keys(obj).length === 0;

export const falsyToString = <T>(value: T) => (typeof value === 'boolean' ? `${value}` : value === 0 ? '0' : value);

/**
 * Merges two given objects, Props take precedence over Defaults
 * @param props
 * @param defaults
 * @returns
 */
export const mergeDefaultsAndProps = <
  V extends RecipeVariantRecord,
  P extends RecipeSelection<V> & ClassProp,
  D extends RecipeSelection<V>,
>(
  props: P = {} as P,
  defaults: D,
) => {
  const result: Record<PropertyKey, unknown> = { ...defaults };

  for (const key in props) {
    const value = props[key];
    if (typeof value !== 'undefined') {
      result[key] = value;
    }
  }

  return result as Record<keyof V, NonNullable<ClassValue>>;
};

/**
 * Returns a list of class variants based on the given Props and Defaults
 * @param props
 * @param variants
 * @param defaults
 * @returns
 */
export const getVariantClassNames = <
  V extends RecipeVariantRecord,
  P extends RecipeSelection<V> & ClassProp,
  D extends RecipeSelection<V>,
>(
  props: P = {} as P,
  variants: V,
  defaults: D = {} as D,
) => {
  let variantClassNames = '';

  for (const variant in variants) {
    const variantProp = props[variant] ?? defaults[variant];
    const variantKey = falsyToString(variantProp) as string;

    const className = variants[variant][variantKey];

    if (className) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      variantClassNames && (variantClassNames += ' ');
      variantClassNames += className;
    }
  }

  return variantClassNames;
};

/**
 * Returns selected compound className variants based on Props and Defaults
 * @param compoundVariants
 * @param defaultsAndProps
 * @returns
 */
export const getCompoundVariantClassNames = <V extends RecipeVariantRecord>(
  compoundVariants: Pretty<RecipeCompoundVariant<RecipeCompoundSelection<V>>>[],
  defaultsAndProps: ClassDictionary,
) => {
  let compoundClassNames = '';

  for (const compoundConfig of compoundVariants) {
    let selectorMatches = true;

    for (const cvKey in compoundConfig) {
      if (cvKey === 'class' || cvKey === 'className') continue;

      const cvSelector = compoundConfig[cvKey];
      const selector = defaultsAndProps[cvKey];

      const matches = Array.isArray(cvSelector) ? cvSelector.includes(selector) : selector === cvSelector;

      if (!matches) {
        selectorMatches = false;
        break;
      }
    }

    if (selectorMatches) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      compoundClassNames && (compoundClassNames += ' ');
      compoundClassNames += compoundConfig.class ?? compoundConfig.className;
    }
  }

  return compoundClassNames;
};

/**
 * Returns a list of class variants based on the given Props and Defaults for the required Slot
 * @param props
 * @param slot
 * @param variants
 * @param defaults
 * @returns
 */
export const getVariantClassNamesBySlot = <
  S extends string,
  V extends SlotRecipeVariantRecord<S>,
  P extends RecipeSelection<V> & ClassProp,
  D extends RecipeSelection<V>,
>(
  props: P = {} as P,
  slot: S,
  variants: V,
  defaults: D = {} as D,
) => {
  let variantClassNames = '';

  for (const variant in variants) {
    const variantProp = props[variant] ?? defaults[variant];
    const variantKey = falsyToString(variantProp);

    const className = (variants[variant][variantKey] as SlotRecord<S, ClassValue>)?.[slot];

    if (className) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      variantClassNames && (variantClassNames += ' ');
      variantClassNames += className;
    }
  }
  return variantClassNames;
};

/**
 * Returns selected compound className variants based on Props and Defaults for the required Slot
 * @param slot
 * @param compoundVariants
 * @param defaultsAndProps
 * @returns
 */
export const getCompoundVariantClassNamesBySlot = <
  S extends string,
  V extends SlotRecipeVariantRecord<S> = SlotRecipeVariantRecord<S>,
>(
  slot: S,
  compoundVariants: Pretty<SlotRecipeCompoundVariant<S, RecipeCompoundSelection<V>>>[],
  defaultsAndProps: ClassDictionary,
) => {
  let compoundClassNames = '';

  for (const compoundConfig of compoundVariants) {
    let selectorMatches = true;

    for (const cvKey in compoundConfig) {
      if (cvKey === 'class' || cvKey === 'className') continue;

      const cvSelector = compoundConfig[cvKey];
      const selector = defaultsAndProps[cvKey];

      const matches = Array.isArray(cvSelector) ? cvSelector.includes(selector) : selector === cvSelector;

      if (!matches) {
        selectorMatches = false;
        break;
      }
    }

    const className = compoundConfig.class?.[slot] ?? compoundConfig.className?.[slot];

    if (selectorMatches && className) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      compoundClassNames && (compoundClassNames += ' ');
      compoundClassNames += className;
    }
  }

  return compoundClassNames;
};
