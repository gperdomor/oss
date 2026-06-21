/* =============================================================================
 * Types
 * =============================================================================*/

/* -----------------------------------------
 * clsx
 * -----------------------------------------*/

export type ClassValue = string | boolean | null | undefined;
export type ClassDictionary = Record<string, any>;

/* -----------------------------------------
 * Utils
 * -----------------------------------------*/

export type Pretty<T> = { [K in keyof T]: T[K] } & {};
type StringToBoolean<T> = T extends 'true' | 'false' ? boolean : T;
type OneOrMore<T> = T | Array<T>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type OmitUndefined<T> = T extends undefined ? never : T;

/**
 * Extract the variant as optional props from a `cvb` or `svb` function.
 * Intended to be used with a JSX component.
 */
export type VariantProps<Component extends (...args: any) => any> = Omit<
  OmitUndefined<Parameters<Component>[0]>,
  'class' | 'className'
>;

/* -----------------------------------------
 * compose
 * -----------------------------------------*/

export interface Compose {
  <T extends ReturnType<RecipeCreatorFn>[]>(
    ...components: [...T]
  ): (
    props?: (
      | UnionToIntersection<
          {
            [K in keyof T]: VariantProps<T[K]>;
          }[number]
        >
      | undefined
    ) &
      ClassProp,
  ) => string;
}

/* -----------------------------------------
 * cx
 * -----------------------------------------*/

export interface CX {
  (...inputs: ClassValue[]): string;
}

export type CXOptions = Parameters<CX>;
export type CXReturn = ReturnType<CX>;

/* =============================================================================
 * cvb
 * =============================================================================*/

export type ClassProp =
  | {
      class?: ClassValue;
      className?: never;
    }
  | {
      class?: never;
      className?: ClassValue;
    };

export type RecipeVariantRecord = Record<any, Record<any, ClassValue>>;
export type RecipeSelection<T extends RecipeVariantRecord | SlotRecipeVariantRecord<string>> = {
  [K in keyof T]?: StringToBoolean<keyof T[K]> | undefined;
};

/* -----------------------------------------
 * Recipe / Standard
 * -----------------------------------------*/

export type RecipeVariantFn<T extends RecipeVariantRecord> = (props?: RecipeSelection<T> & ClassProp) => string;

export type RecipeCompoundSelection<T> = {
  [K in keyof T]?: OneOrMore<StringToBoolean<keyof T[K]>> | undefined;
};

export type RecipeCompoundVariant<T> = T & ClassProp;

export interface RecipeDefinition<T extends RecipeVariantRecord = RecipeVariantRecord> {
  /**
   * Base styles applied to every instance of the component, regardless of variant selection.
   * These form the foundation of your component's appearance.
   *
   * @example
   * base: 'flex items-center justify-center rounded-md font-medium transition-colors',
   */
  base?: ClassValue;
  /**
   * A collection of variant groups, each containing mutually exclusive styling options.
   * Variants allow your component to adapt to different contexts and requirements.
   *
   * @example
   * variants: {
   *   size: {
   *     sm: 'text-sm px-2 py-1',
   *     md: 'text-base px-4 py-2',
   *   },
   *   color: {
   *     primary: 'bg-blue-500 text-white hover:bg-blue-600',
   *     secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300'
   *   },
   *   rounded: {
   *     true: 'rounded-full',
   *     false: 'rounded-md'
   *   }
   * }
   */
  variants?: T;
  /**
   * Styles applied when specific combinations of variants are selected.
   * This enables complex conditional styling based on multiple variant selections.
   *
   * @example
   * compoundVariants: [
   *   {
   *     // Apply when size is small and color is primary
   *     size: 'sm',
   *     color: 'primary',
   *     class: 'uppercase tracking-wider'
   *   },
   *   {
   *     // Apply when size is either md or lg and rounded is true
   *     size: ['md', 'lg'],
   *     rounded: true,
   *     class: 'shadow-md'
   *   }
   * ]
   */
  compoundVariants?: Pretty<RecipeCompoundVariant<RecipeCompoundSelection<T>>>[];
  /**
   * Predefined variant selections to apply when no specific variants are provided.
   * These act as the component's factory settings for a consistent default appearance.
   *
   * @example
   * defaultVariants: {
   *   size: 'md',
   *   color: 'primary',
   *   rounded: false
   * }
   */
  defaultVariants?: RecipeSelection<T>;
}

export type RecipeCreatorFn = <T extends RecipeVariantRecord>(config: RecipeDefinition<T>) => RecipeVariantFn<T>;

/* -----------------------------------------
 * Recipe / Slot
 * -----------------------------------------*/

export type SlotRecord<S extends string, T> = Partial<Record<S, T>>;

export type SlotRecipeVariantRecord<S extends string> = Record<any, Record<any, SlotRecord<S, ClassValue>>>;

export type SlotRecipeVariantFn<S extends string, T extends SlotRecipeVariantRecord<S>> = (
  props?: RecipeSelection<T> & SlotClassProp<S>,
) => SlotRecord<S, string>;

export type SlotClassProp<S extends string> =
  | {
      class?: SlotRecord<S, ClassValue>;
      className?: never;
    }
  | {
      class?: never;
      className?: SlotRecord<S, ClassValue>;
    };

export type SlotRecipeCompoundVariant<S extends string, T> = T & SlotClassProp<S>;

export interface SlotRecipeDefinition<
  S extends string = string,
  T extends SlotRecipeVariantRecord<S> = SlotRecipeVariantRecord<S>,
> {
  /**
   * An array of named slots that make up the component.
   * Each slot represents a distinct part of the component that can be styled independently.
   *
   * @example
   * slots: ['root', 'header', 'body']
   */
  slots: S[] | Readonly<S[]>;
  /**
   * Base styles applied to each slot, regardless of any variants selected.
   * These styles form the foundation of your component's appearance.
   *
   * @example
   * base: {
   *   root: 'flex flex-col border rounded-lg overflow-hidden',
   *   header: 'p-4 font-semibold border-b bg-gray-50',
   *   body: 'p-4',
   * }
   */
  base?: SlotRecord<S, ClassValue>;
  /**
   * Multi-variant styles organized by variant groups and options.
   * Each variant option contains styles for specific slots, allowing different
   * parts of your component to respond to the same variant changes.
   *
   * @example
   * variants: {
   *   size: {
   *     sm: { root: 'text-sm', header: 'py-2' },
   *     lg: { root: 'text-lg', header: 'py-4' }
   *   },
   *   rounded: {
   *     true: { root: 'rounded-full' }
   *   }
   * }
   */
  variants?: T;
  /**
   * Conditional styles that apply only when a specific combination of variants is selected.
   * This enables complex styling logic that depends on multiple variant selections.
   *
   * @example
   * compoundVariants: [
   *   {
   *     size: 'sm',
   *     rounded: true,
   *     class: { root: 'shadow-sm', header: 'uppercase' }
   *   },
   *   {
   *     size: ['md', 'lg'],
   *     rounded: false,
   *     class: { root: 'shadow-md' }
   *   }
   * ]
   */
  compoundVariants?: Pretty<SlotRecipeCompoundVariant<S, RecipeCompoundSelection<T>>>[];
  /**
   * Predefined variant selections to apply when no specific variants are provided.
   * These act as the component's factory settings, ensuring consistent appearance
   * even without explicit configuration.
   *
   * @example
   * defaultVariants: {
   *   size: 'md',
   *   rounded: false
   * }
   */
  defaultVariants?: RecipeSelection<T>;
}

export type SlotRecipeCreatorFn = <S extends string, T extends SlotRecipeVariantRecord<S>>(
  config: SlotRecipeDefinition<S, T>,
) => SlotRecipeVariantFn<S, T>;

/* -----------------------------------------
 * defineConfig
 * -----------------------------------------*/

export interface DefineConfigOptions {
  hooks?: {
    /**
     * A hook function called after class names are concatenated but before they're returned.
     * This enables post-processing of the final class string, such as deduplication or
     * resolving class conflicts.
     *
     * @param className - The fully concatenated class string generated by CVB functions
     * @returns The processed class string that will be returned to the caller
     */
    onComplete?: (className: string) => string;
  };
}

export interface DefineConfig {
  (options?: DefineConfigOptions): {
    compose: Compose;
    cx: CX;
    cvb: RecipeCreatorFn;
    svb: SlotRecipeCreatorFn;
  };
}
