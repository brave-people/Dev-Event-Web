import { UrlContext } from 'types/Context';
import { handleUndefined } from 'lib/utils/eventUtil';

export const initUrl = (
  url: string,
  type: string,
  jobGroupList: string[] | undefined,
  eventType: string | undefined,
  location: string | undefined,
  coast: string | undefined,
  search: string | undefined
) => {
  if (handleUndefined(jobGroupList?.join(', '), eventType, location, coast))
    return '/events';
  if (url.includes(type) === false) {
    return url;
  } else {
    const sepUrls = url.split(/[?&]/).filter((sepUrl) => {
      return (
        sepUrl.includes(type) === false && sepUrl.includes('/search') === false
      );
    });
    const len = sepUrls.length;

    if (sepUrls === undefined || len === 0) return '/events';
    else if (sepUrls !== undefined && len === 1) return `/search?${sepUrls[0]}`;
    else {
      return `/search?${sepUrls[0]}&${sepUrls.slice(1, len).join('&')}`;
    }
  }
};

export const parseUrl = (
  url: string,
  type: string,
  option: string,
  jobGroupList: string[] | undefined
) => {
  if (url.includes('/event') || url.includes('/calender'))
    return `/search?${type}=${option}`;
  if (url.includes(`${type}`) && type !== 'tag') {
    const key = getKey(url, type);
    if (key !== undefined) {
      return url.replace(key, `${type}=${option}`);
    }
  } else if (url.includes(`${type}`) && type === 'tag') {
    const value = getValue(option, jobGroupList);
    if (value === true) {
      const newUrl = deleteUrl(jobGroupList, option);
      const currentUrl = getCurrentUrl(url);

      if (
        (newUrl === undefined || newUrl.length === 0) &&
        (currentUrl === undefined || currentUrl?.length === 0)
      )
        return '/events';
      else if (
        newUrl !== undefined &&
        newUrl.length !== 0 &&
        (currentUrl === undefined || currentUrl?.length === 0)
      )
        return `/search?tag=${newUrl.join('&tag=')}`;
      else if (
        (newUrl === undefined || newUrl.length === 0) &&
        currentUrl !== undefined &&
        currentUrl.length !== 0
      )
        return `/search?${currentUrl.join('&')}`;
      else if (
        newUrl !== undefined &&
        newUrl.length !== 0 &&
        currentUrl !== undefined &&
        currentUrl.length !== 0
      )
        return `/search?tag=${newUrl.join('&tag=')}&${currentUrl.join('&')}`;
    }
  }
  return `${url}&${type}=${option}`;
};

const getKey = (url: string, type: string) => {
  const newUrl: string[] = url.split(/[?&]/);
  for (let i = 0; i < newUrl.length; i++) {
    if (newUrl[i].includes(`${type}`)) {
      return newUrl[i];
    }
  }
  return undefined;
};

export const getValue = (
  option: string,
  jobGroupList: string[] | undefined
): boolean => {
  if (jobGroupList?.includes(option)) {
    return true;
  }
  return false;
};

export const getCurrentUrl = (url: string): string[] | undefined => {
  const currentUrl = url.split(/[?&]/).filter((item) => {
    return !item.includes('tag') && !item.includes('/search');
  });
  return currentUrl;
};

const deleteUrl = (jobGroupList: string[] | undefined, option: string) => {
  const newUrl = jobGroupList?.filter((item) => {
    return item !== option;
  });
  return newUrl;
};

export const reflactUrlContext = (url: string): UrlContext => {
  let result: UrlContext = {
    tagList: [],
    type: undefined,
    location: undefined,
    coast: undefined,
    kwd: undefined,
  };
  const context = url.split(/[?&]/);
  for (let i = 0; i < context.length; i++) {
    if (context[i].includes('tag')) {
      result.tagList.push(context[i].split('=')[1]);
    } else if (context[i].includes('type')) {
      result.type = context[i].split('=')[1];
    } else if (context[i].includes('location')) {
      result.location = context[i].split('=')[1];
    } else if (context[i].includes('coast')) {
      result.coast = context[i].split('=')[1];
    } else if (context[i].includes('kwd')) {
      result.kwd = context[i].split('=')[1];
    }
  }
  return result;
};
