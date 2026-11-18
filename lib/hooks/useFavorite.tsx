import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { mutate } from 'swr';
import { AuthContext } from 'context/auth';
import { useToast } from 'context/toast';
import { deleteMyEventApi } from 'lib/api/delete';
import { createMyEventApi } from 'lib/api/post';
import { useMyEvent } from 'lib/hooks/useSWR';
import * as ga from 'lib/utils/gTag';
import { Event } from 'model/event';

const PARAM = { filter: '' };
// KEY는 PARAM에서 만든다. useMyEvent(PARAM, ...)의 SWR 키와 같아야 한다.
const KEY = [`/front/v1/favorite/events`, PARAM];

// 재조회가 끝날 때까지 기다리되, 실패해도 예외를 밖으로 내보내지 않는다.
const refetch = () => mutate(KEY).catch(() => undefined);

export const useFavorite = () => {
  const { isLoggedIn, isChecked } = useContext(AuthContext);
  const { pushToast } = useToast();
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const pending = useRef<Set<string>>(new Set());

  const { myEvent } = useMyEvent(PARAM, isLoggedIn);

  // 바뀌는 값은 ref로 읽어, toggleFavorite이 매 렌더 새 함수가 되지 않게 한다
  const latest = useRef({ isLoggedIn, isChecked, myEvent, pushToast });
  latest.current = { isLoggedIn, isChecked, myEvent, pushToast };

  const favoriteIds = useMemo(() => {
    const ids: Record<string, true> = {};
    if (isLoggedIn && myEvent) {
      myEvent.forEach((item) => {
        ids[item.dev_event.id] = true;
      });
    }
    return ids;
  }, [isLoggedIn, myEvent]);

  const isFavorite = useCallback(
    (eventId: string): boolean => favoriteIds[eventId] === true,
    [favoriteIds]
  );

  const toggleFavorite = useCallback(async (event: Event): Promise<void> => {
    const {
      isLoggedIn: loggedIn,
      isChecked: checked,
      myEvent: current,
      pushToast: toast,
    } = latest.current;
    // 로그인 확인 전에는 담아 둔 행사도 빈 하트로 보여 누른 뜻을 알 수 없다
    if (!checked) return;
    if (!loggedIn) {
      setLoginModalIsOpen(true);
      return;
    }
    if (!current) return;
    if (pending.current.has(event.id)) return;

    pending.current.add(event.id);
    const snapshot = current;
    try {
      const found = current.find((item) => item.dev_event.id === event.id);
      const favoriteId = found ? found.favorite_id : 0;

      if (favoriteId === 0) {
        mutate(
          KEY,
          current.concat({ favorite_id: favoriteId, dev_event: event }),
          false
        );
        await createMyEventApi(`/front/v1/favorite/events/${event.id}`, {
          eventId: Number(event.id),
        });
        ga.event({
          action: 'web_event_관심행사추가버튼클릭',
          event_category: 'web_event',
          event_label: '관심행사',
        });
        toast('관심 행사에 담았어요');
      } else {
        mutate(
          KEY,
          current.filter((item) => item.favorite_id !== favoriteId),
          false
        );
        await deleteMyEventApi(`/front/v1/favorite/events/${favoriteId}`, {
          favoriteId,
        });
        ga.event({
          action: 'web_event_관심행사삭제버튼클릭',
          event_category: 'web_event',
          event_label: '관심행사',
        });
        toast('관심 행사에서 뺐어요');
      }
      await refetch();
    } catch (error) {
      mutate(KEY, snapshot, false);
      toast('처리 중 오류가 발생했어요', 'plain');
      await refetch();
    } finally {
      pending.current.delete(event.id);
    }
  }, []);

  const closeLoginModal = useCallback(() => setLoginModalIsOpen(false), []);

  return { isFavorite, toggleFavorite, loginModalIsOpen, closeLoginModal };
};
