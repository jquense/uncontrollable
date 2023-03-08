import { useCallback, useRef, useState } from 'react';

export type Handler = (...args: any[]) => any;

export function defaultKey(key: string) {
  return 'default' + key.charAt(0).toUpperCase() + key.substr(1);
}

function useUncontrolledProp<TProp, THandler extends Handler = Handler>(
  propValue: TProp | undefined,
  defaultValue: TProp,
  handler?: THandler
): readonly [TProp, THandler];
function useUncontrolledProp<TProp, THandler extends Handler = Handler>(
  propValue: TProp | undefined,
  defaultValue?: TProp | undefined,
  handler?: THandler
): readonly [TProp | undefined, THandler];
function useUncontrolledProp<TProp, THandler extends Handler = Handler>(
  propValue: TProp | undefined,
  defaultValue: TProp | undefined,
  handler?: THandler
) {
  const wasPropRef = useRef<boolean>(propValue !== undefined);
  const [stateValue, setState] = useState<TProp | undefined>(defaultValue);

  const isProp = propValue !== undefined;
  const wasProp = wasPropRef.current;

  wasPropRef.current = isProp;

  /**
   * If a prop switches from controlled to Uncontrolled
   * reset its value to the defaultValue
   */
  if (!isProp && wasProp && stateValue !== defaultValue) {
    setState(defaultValue);
  }

  return [
    isProp ? propValue : stateValue,
    useCallback(
      (value: TProp, ...args: any[]) => {
        if (handler) handler(value, ...args);
        setState(value);
      },
      [handler]
    ) as THandler,
  ] as const;
}

export { useUncontrolledProp };

type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: NonNullable<Base[Key]> extends Condition ? Key : never;
};
type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];

type ConfigMap<TProps extends object> = {
  [p in keyof TProps]?: AllowedNames<TProps, Function>;
};

export function useUncontrolled<
  TProps extends object,
  TDefaults extends string = never
>(props: TProps, config: ConfigMap<TProps>): Omit<TProps, TDefaults> {
  return Object.keys(config).reduce((result: TProps, fieldName: string) => {
    const {
      [defaultKey(fieldName)]: defaultValue,
      [fieldName]: propsValue,
      ...rest
    } = result as any;

    const handlerName = config[fieldName];
    const [value, handler] = useUncontrolledProp(
      propsValue,
      defaultValue,
      props[handlerName]
    );

    return {
      ...rest,
      [fieldName]: value,
      [handlerName]: handler,
    };
  }, props);
}
