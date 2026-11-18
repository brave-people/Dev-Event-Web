import { Event } from 'model/event';
import { describeEvent } from 'lib/utils/timeline/describeEvent';
import {
  DAY_MS,
  dayKey,
  diffDays,
  formatHm,
  formatMdw,
  parseNaive,
} from 'lib/utils/timeline/kst';
import { readEventPeriod } from 'lib/utils/timeline/period';

export type ApplyPhase =
  | 'ended'
  | 'before'
  | 'recruiting'
  | 'upcoming'
  | 'ongoing'
  | 'unknown';
export type ApplyTone = 'orange' | 'blue' | 'gray';

export interface ApplyProgress {
  percent: number; // 0~100 정수
  startLabel: string; // '10.19(월) 접수 시작'
  endLabel: string; // '11.19(목) 18:00 마감'
}

export interface ApplyInfo {
  phase: ApplyPhase;
  state: string; // 카드 왼쪽: '접수 중 · 유료'
  status: string; // 카드 오른쪽: '마감까지 6일 8시간'
  tone: ApplyTone; // 오른쪽 글자 색
  progress: ApplyProgress | null; // 접수형이고 끝나지 않았을 때만
  canApply: boolean; // false면 버튼이 "종료된 행사예요"
}

const MIN_MS = 60000;
const HOUR_MS = 60 * MIN_MS;

export const costOf = (
  tags: { tag_name: string }[] | null | undefined
): string => {
  const list = tags || [];
  for (let i = 0; i < list.length; i += 1) {
    const name = list[i].tag_name;
    if (name === '무료' || name === '유료') return name;
  }
  return '';
};

export const formatRemain = (ms: number): string => {
  const total = Math.max(ms, 0);
  if (total >= DAY_MS) {
    const days = Math.floor(total / DAY_MS);
    const hours = Math.floor((total % DAY_MS) / HOUR_MS);
    return hours ? `${days}일 ${hours}시간` : `${days}일`;
  }
  if (total >= HOUR_MS) {
    const hours = Math.floor(total / HOUR_MS);
    const minutes = Math.floor((total % HOUR_MS) / MIN_MS);
    return minutes ? `${hours}시간 ${minutes}분` : `${hours}시간`;
  }
  return `${Math.max(Math.floor(total / MIN_MS), 1)}분`;
};

export const ddayLabel = (event: Event, now: string): string => {
  const period = readEventPeriod(event);
  if (!period) return '';
  const today = dayKey(parseNaive(now));
  const { status } = describeEvent(event, now);
  if (status === 'ended') return '종료';
  if (status === 'recruiting') {
    const left = diffDays(period.endDay, today);
    return left <= 0 ? '오늘 마감' : `마감 D-${left}`;
  }
  if (status === 'upcoming') {
    const left = diffDays(period.startDay, today);
    return left <= 0 ? '오늘' : `D-${left}`;
  }
  return '진행 중';
};

const withCost = (label: string, cost: string): string =>
  cost ? (label ? `${label} · ${cost}` : cost) : label;

export const describeApply = (event: Event, now: string): ApplyInfo => {
  const cost = costOf(event.tags);
  const period = readEventPeriod(event);
  if (!period) {
    return {
      phase: 'unknown',
      state: withCost('', cost),
      status: '',
      tone: 'blue',
      progress: null,
      canApply: true,
    };
  }

  const nowMs = parseNaive(now);
  const today = dayKey(nowMs);
  const { status } = describeEvent(event, now);

  if (status === 'ended') {
    return {
      phase: 'ended',
      state: withCost('종료', cost),
      status: '종료된 행사예요',
      tone: 'gray',
      progress: null,
      canApply: false,
    };
  }

  if (status === 'recruiting') {
    let deadline: string;
    if (period.endHasTime) {
      deadline = `마감까지 ${formatRemain(period.endAt - nowMs)}`;
    } else {
      const left = diffDays(period.endDay, today);
      deadline = left <= 0 ? '오늘 마감' : `마감까지 ${left}일`;
    }
    let progress: ApplyProgress | null = null;
    if (period.startKnown) {
      const ratio =
        period.endAt > period.startAt
          ? (nowMs - period.startAt) / (period.endAt - period.startAt)
          : 0;
      progress = {
        percent: Math.round(Math.min(Math.max(ratio, 0), 1) * 100),
        startLabel: `${formatMdw(period.startDay)} 접수 시작`,
        endLabel: `${formatMdw(period.endDay)}${
          period.endHasTime ? ` ${formatHm(period.endAt)}` : ''
        } 마감`,
      };
    }
    const before = period.startKnown && period.startAt > nowMs;
    return {
      phase: before ? 'before' : 'recruiting',
      state: withCost(before ? '접수 전' : '접수 중', cost),
      status: deadline,
      tone: 'orange',
      progress,
      canApply: true,
    };
  }

  if (status === 'upcoming') {
    const left = diffDays(period.startDay, today);
    return {
      phase: 'upcoming',
      state: withCost('예정', cost),
      status: left <= 0 ? '오늘 열려요' : `D-${left}`,
      tone: 'blue',
      progress: null,
      canApply: true,
    };
  }

  return {
    phase: 'ongoing',
    state: withCost('진행 중', cost),
    status: '지금 진행 중',
    tone: 'blue',
    progress: null,
    canApply: true,
  };
};
