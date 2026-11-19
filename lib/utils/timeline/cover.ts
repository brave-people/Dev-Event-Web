export const COVER_KINDS: readonly string[] = [
  '세미나',
  '모임',
  '대회',
  '교육',
  '커뮤니티',
];

const MODES = ['온라인', '오프라인'];
const COVER_HOST = 'brave-people-3.s3.ap-northeast-2.amazonaws.com';

export interface AutoCover {
  index: number;
  kind: string;
  mode: string[];
}

export const isUsableCover = (url: string | null | undefined): boolean =>
  !!url && url.indexOf(COVER_HOST) !== -1;

export const hasCoverLink = (url: string | null | undefined): boolean =>
  !!url && url.trim() !== '';

export const autoCover = (tags: { tag_name: string }[]): AutoCover => {
  const names = tags.map((tag) => tag.tag_name);
  let index = 0;
  let kind = '행사';
  for (let i = 0; i < names.length; i += 1) {
    const found = COVER_KINDS.indexOf(names[i]);
    if (found !== -1) {
      index = found;
      kind = COVER_KINDS[found];
      break;
    }
  }
  return {
    index,
    kind,
    mode: names.filter((name) => MODES.indexOf(name) !== -1),
  };
};

export const coverCaption = (cover: AutoCover): string =>
  cover.mode.length > 0
    ? `${cover.kind} · ${cover.mode.join('·')}`
    : cover.kind;
