/* @flow */

import rest from './data/rest';

type Fetch = (url: string, options: ?any) => Promise<any>;

type Options = {
  baseUrl: string,
  cookie?: string,
  isSSR: boolean,
};

function createFetch(fetch: Fetch, { baseUrl, cookie, isSSR }: Options) {
  const defaults = {
    method: 'POST', // handy with GraphQL backends
    mode: baseUrl ? 'cors' : 'same-origin',
    credentials: baseUrl ? 'include' : 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : null),
    },
  };

  return async (url: string, options: any) => {
    if (isSSR) {
      const query = JSON.parse(options.body);
      const result = await rest(query.query, query.variables);
      return Promise.resolve({
        status: result.errors ? 400 : 200,
        json: () => Promise.resolve(result),
      });
    }

    return fetch(url, {
      ...defaults,
      ...options,
      headers: {
        ...defaults.headers,
        ...(options && options.headers),
      },
    });
  };
}

export default createFetch;
