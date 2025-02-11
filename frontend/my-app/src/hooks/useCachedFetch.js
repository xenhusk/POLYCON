import { useRef } from 'react';

const responseCache = {};

export const useCachedFetch = () => {
  const pendingRequests = useRef({});

  const cachedFetch = async (url, options = {}) => {
    if (responseCache[url]) {
      return responseCache[url];
    }
    if (pendingRequests.current[url]) {
      return pendingRequests.current[url];
    }
    const promise = fetch(url, options)
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(data => {
        responseCache[url] = data;
        delete pendingRequests.current[url];
        return data;
      })
      .catch(err => {
        delete pendingRequests.current[url];
        throw err;
      });
    pendingRequests.current[url] = promise;
    return promise;
  };

  return { cachedFetch };
};
