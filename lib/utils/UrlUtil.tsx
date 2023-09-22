import { handleUndefined } from 'lib/utils/eventUtil';
import { UrlContext } from 'types/Context';

export const initUrl = (
  url: string,
  type: string,
  jobGroupList: string[] | undefined,
  eventType: string | undefined,
  location: string | undefined,
  coast: string | undefined,
  search: string | undefined
) => {
  if (handleUndefined(jobGroupList?.join(', '), eventType, location, coast, search)) return '/events';
  if (!url.includes(type)) return url;
  else {
    const sepUrls = url.split('?').filter((sepUrl) => {
      return !sepUrl.includes(type);
    });
    const joinUrl = sepUrls.join('?');
    if (joinUrl === '/search') return '/events';
    return joinUrl;
  }
};

export const parseUrl = (url: string, type: string, option: string, jobGroupList: string[] | undefined) => {
  if (url.includes('/event') || url.includes('/calender')) return `/search?${type}=${option}`;
  if (url.includes(`${type}`) && type !== 'tag') {
    const key = getKey(url, type);
    if (key !== undefined) {
      return url.replace(key, `${type}=${option}`);
    }
  } else if (url.includes(`${type}`) && type === 'tag') {
    const value = getValue(option, jobGroupList);
    if (value) {
      const newUrl = deleteUrl(jobGroupList, option);
      const currentUrl = getCurrentUrl(url);
      if ((newUrl === undefined || newUrl.length === 0) && (currentUrl === undefined || currentUrl?.length === 0))
        return '/events';
      return `/search${newUrl === undefined || newUrl?.length === 0 ? '' : `?tag=${newUrl?.join('?tag=')}`}
				${currentUrl === undefined || currentUrl?.length === 0 ? '' : `?${currentUrl.join('?')}`}
				`;
    }
  }
  return `${url}?${type}=${option}`;
};

const getKey = (url: string, type: string) => {
  const newUrl: string[] = url.split('?');
  for (let i = 0; i < newUrl.length; i++) {
    if (newUrl[i].includes(`${type}`)) {
      return newUrl[i];
    }
  }
  return undefined;
};

export const getValue = (option: string, jobGroupList: string[] | undefined): boolean => {
  return !!jobGroupList?.includes(option);
};

export const getCurrentUrl = (url: string): string[] | undefined => {
  return url.split('?').filter((item) => !item.includes('tag') && !item.includes('/search'));
};

const deleteUrl = (jobGroupList: string[] | undefined, option: string) => {
  return jobGroupList?.filter((item) => item !== option);
};

export const reflactUrlContext = (url: string): UrlContext => {
  const result: UrlContext = {
    tagList: [],
    type: undefined,
    location: undefined,
    coast: undefined,
    kwd: undefined,
  };
  const context = url.split('?');
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
