import { useEffect, useState } from 'react';
import { toKstNaive } from 'lib/utils/timeline/kst';

export const useNow = (initial: string): string => {
  const [now, setNow] = useState(initial);

  useEffect(() => {
    const refresh = () => setNow(toKstNaive(Date.now()));
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    refresh();
    const timer = setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return now;
};
