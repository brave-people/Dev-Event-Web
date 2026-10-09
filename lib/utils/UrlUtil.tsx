import { UrlContext } from 'types/Context';
import { handleUndefined } from 'lib/utils/eventUtil';

// 'kwd=typescript'처럼 값에 다른 키 이름(type)이 들어 있어도 키로 오인하지 않도록 '=' 앞부분만 비교한다
const getParamKey = (segment: string) => segment.split('=')[0];

// 잘못된 % 인코딩(예: '50%')이 들어와도 화면이 깨지지 않도록 받은 문자열을 그대로 쓴다
export const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const initUrl = (
  url: string,
  type: string,
  jobGroupList: string[] | undefined,
  eventType: string | undefined,
  location: string | undefined,
  coast: string | undefined
) => {
  if (handleUndefined(jobGroupList?.join(', '), eventType, location, coast))
    return '/events';
  if (getKey(url, type) === undefined) {
    return url;
  } else {
    const sepUrls = url.split(/[?&]/).filter((sepUrl) => {
      return (
        getParamKey(sepUrl) !== type && sepUrl.includes('/search') === false
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
  // 검색어에는 &·#·%·+ 같은 문자가 들어올 수 있어 인코딩해서 넣는다
  const paramValue = type === 'kwd' ? encodeURIComponent(option) : option;
  if (url.includes('/event') || url.includes('/calender'))
    return `/search?${type}=${paramValue}`;
  const key = getKey(url, type);
  if (key !== undefined && type !== 'tag') {
    return url.replace(key, `${type}=${paramValue}`);
  } else if (key !== undefined && type === 'tag') {
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
  return `${url}&${type}=${paramValue}`;
};

const getKey = (url: string, type: string) => {
  const newUrl: string[] = url.split(/[?&]/);
  for (let i = 0; i < newUrl.length; i++) {
    if (getParamKey(newUrl[i]) === type) {
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
    return getParamKey(item) !== 'tag' && !item.includes('/search');
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
  const result: UrlContext = {
    tagList: [],
    type: undefined,
    location: undefined,
    coast: undefined,
    kwd: undefined,
  };
  const context = url.split(/[?&]/);
  for (let i = 0; i < context.length; i++) {
    const key = getParamKey(context[i]);
    if (key === 'tag') {
      result.tagList.push(context[i].split('=')[1]);
    } else if (key === 'type') {
      result.type = context[i].split('=')[1];
    } else if (key === 'location') {
      result.location = context[i].split('=')[1];
    } else if (key === 'coast') {
      result.coast = context[i].split('=')[1];
    } else if (key === 'kwd') {
      result.kwd = context[i].split('=')[1];
    }
  }
  return result;
};
