import { pathToRegexp } from 'path-to-regexp';
import createError from 'http-errors';

type OptionType = {
  [key: string]: string;
};

export function route(options?: OptionType): any {
  options = options || {};

  return function (path: string) {
    const keys: any[] = [];
    const re = pathToRegexp(path, keys, options);

    return function (pathname: string, params?: any): any {
      const m = re.exec(pathname);
      if (!m) return false;

      params = params || {};

      let key, param;
      for (let i = 0; i < keys.length; i++) {
        key = keys[i];
        param = m[i + 1];
        if (!param) continue;
        params[key.name] = decodeParam(param);
        if (key.repeat)
          params[key.name] = params[key.name].split(key.delimiter);
      }

      return params;
    };
  };
}

export function decodeParam(param: string): string {
  try {
    return decodeURIComponent(param);
  } catch (_) {
    throw createError(400, 'failed to decode param "' + param + '"');
  }
}
