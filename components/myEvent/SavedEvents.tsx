import { useCallback, useMemo, useRef } from 'react';

import classNames from 'classnames/bind';
import { useRouter } from 'next/router';
import { mutate } from 'swr';

import { useToast } from 'context/toast';
import { deleteMyEventApi } from 'lib/api/delete';
import { useMyEvent } from 'lib/hooks/useSWR';
import { useNow } from 'lib/hooks/useNow';
import * as ga from 'lib/utils/gTag';
import {
  SavedItem,
  SavedTab,
  savedTabOf,
  splitSaved,
} from 'lib/utils/mypage/savedEvents';

import { MyEvent } from 'model/event';

import SavedBand from './SavedBand';
import SavedList from './SavedList';
import SavedTabs from './SavedTabs';
import style from './SavedEvents.module.scss';

const cn = classNames.bind(style);

// 메인의 관심 버튼과 같은 PARAM·KEY여야 SWR 캐시를 함께 쓴다.
const PARAM = { filter: '' };
const KEY = [`/front/v1/favorite/events`, PARAM];

// 재조회가 끝날 때까지 기다리되, 실패해도 예외를 밖으로 내보내지 않는다.
const refetch = () => mutate(KEY).catch(() => undefined);

function SavedEvents({ now: initialNow }: { now: string }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const now = useNow(initialNow);
  const { myEvent, isError } = useMyEvent(PARAM, true);

  const view = useMemo(() => splitSaved(myEvent, now), [myEvent, now]);
  const active = savedTabOf(router.query.tab);
  const items = myEvent || isError ? view[active] : null;

  const pending = useRef<Set<number>>(new Set());
  // 바뀌는 값은 ref로 읽어, onRemove가 매 렌더 새 함수가 되지 않게 한다
  const latest = useRef({ myEvent, pushToast });
  latest.current = { myEvent, pushToast };

  const onSelect = useCallback(
    (tab: SavedTab) => {
      if (tab === savedTabOf(router.query.tab)) return;
      ga.event({
        action:
          tab === 'done'
            ? 'web_event_종료행사탭클릭'
            : 'web_event_진행중인행사탭클릭',
        event_category: 'web_myevent',
        event_label: '내이벤트',
      });
      router.push(tab === 'done' ? '/myevent?tab=done' : '/myevent');
    },
    [router]
  );

  // 다시 불러온 목록에 아직 진행 중인 줄이 들어 있으면 다시 걸러 낸다
  const hidePending = useCallback(
    () =>
      mutate(
        KEY,
        (list?: MyEvent[]) =>
          list?.filter((entry) => !pending.current.has(entry.favorite_id)),
        false
      ).catch(() => undefined),
    []
  );

  const onRemove = useCallback(async (item: SavedItem): Promise<void> => {
    const { favoriteId } = item;
    const { myEvent: current, pushToast: toast } = latest.current;

    if (favoriteId && current) {
      if (pending.current.has(favoriteId)) return;
      pending.current.add(favoriteId);
      try {
        await mutate(
          KEY,
          current.filter((entry) => entry.favorite_id !== favoriteId),
          false
        );
        await deleteMyEventApi(`/front/v1/favorite/events/${favoriteId}`, {
          favoriteId,
        });
        toast('관심 행사에서 뺐어요');
        await refetch();
        hidePending();
        ga.event({
          action: 'web_event_관심행사삭제버튼클릭',
          event_category: 'web_myevent',
          event_label: '관심행사',
        });
      } catch (error) {
        await mutate(KEY, current, false);
        toast('처리 중 오류가 발생했어요', 'plain');
        await refetch();
        hidePending();
      } finally {
        pending.current.delete(favoriteId);
      }
      return;
    }

    alert('이벤트 정보가 없습니다!');
    await refetch();
    ga.event({
      action: 'web_event_관심행사삭제버튼클릭',
      event_category: 'web_myevent',
      event_label: '관심행사',
    });
  }, []);

  return (
    <main className={cn('page')}>
      <SavedBand>
        <h1 className={cn('title')}>관심 행사</h1>
        <SavedTabs
          active={active}
          ongoingCount={view.ongoing.length}
          doneCount={view.done.length}
          onSelect={onSelect}
        />
      </SavedBand>
      <SavedList items={items} isError={!!isError} onRemove={onRemove} />
    </main>
  );
}

export default SavedEvents;
