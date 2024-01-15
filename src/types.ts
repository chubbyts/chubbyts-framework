/**
 * ```ts
 * type WithOptionals = {
 *   title: string;
 *   shortDescription?: string;
 *   description?: string;
 * };
 *
 * type WithoutOptionals = RequiredProperties<WithOptionals, 'shortDescription' | 'description'>;
 * ```
 */
export type RequiredProperties<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};
