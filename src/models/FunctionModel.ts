import { types } from 'mobx-state-tree';

const parseFunction = (value: string) => {
  /* eslint no-new-func: "off" */
  if (value) {
    const fn = new Function(`(${value})`);
    if (typeof fn !== 'function')
      throw new Error(`${value} is not a valid function`);
    return fn;
  } else {
    return value;
  }
};

export const FunctionModel = types.custom<string, any>({
  name: 'functionType',
  fromSnapshot(value: string) {
    return parseFunction(value);
  },
  toSnapshot(value: any) {
    return value?.toString();
  },
  getValidationMessage(value: string) {
    try {
      parseFunction(value);
      return '';
    } catch (e) {
      return `value "${value}" is Not a valid function ${e}`;
    }
  },
  isTargetType(value: any) {
    return value instanceof Function;
  },
});
