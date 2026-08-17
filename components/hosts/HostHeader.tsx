import style from 'components/hosts/HostHeader.module.scss';
import { classificationLabel, fallbackLogo, resolveHostLogo } from 'lib/host/logoFallback';
import { HostDetail } from 'model/host';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

type Props = {
  host: HostDetail;
};

const primaryHomepage = (host: HostDetail) =>
  host.links.find((l) => l.type === 'HOMEPAGE' && l.primary) ??
  host.links.find((l) => l.type === 'HOMEPAGE') ??
  null;

const HostHeader = ({ host }: Props) => {
  const descRef = useRef<HTMLDivElement | null>(null);
  const descBodyRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);

  // 소개는 어드민에서 마크다운으로 작성한다 (행사 상세 내용과 동일한 방식)
  const descriptionHtml = useMemo(() => {
    if (!host.description) return '';
    return marked(host.description, {
      breaks: true, // 줄바꿈을 <br>로 변환
      gfm: true, // GitHub Flavored Markdown 지원
    });
  }, [host.description]);

  // 접힌 높이를 넘겨 실제로 잘리는 경우에만 '더보기'를 노출한다.
  // 마크다운은 제목·목록·이미지가 섞여 줄 수가 일정치 않아 높이로 잰다.
  useEffect(() => {
    const el = descRef.current;
    if (!el) {
      setClamped(false);
      return;
    }
    const measure = () => setClamped(el.scrollHeight > el.clientHeight + 1);
    measure();

    // 본문 이미지는 늦게 로드돼 첫 측정에는 높이가 0 이다. 내용 높이를 계속 관찰한다.
    // (접힌 박스는 max-height 로 고정돼 있어 바깥이 아닌 안쪽을 봐야 한다)
    const body = descBodyRef.current;
    const observer =
      typeof ResizeObserver !== 'undefined' && body ? new ResizeObserver(measure) : null;
    observer?.observe(body as Element);

    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [descriptionHtml, expanded]);

  const logo = resolveHostLogo(host);
  // 이미지 URL 이 죽어 있으면 이니셜 뱃지로 대체한다 (DES-100)
  const [imgFailed, setImgFailed] = useState(false);
  const badge = logo.kind === 'fallback' ? logo : fallbackLogo(host.host_name);
  const showImage = logo.kind === 'image' && !imgFailed;
  const homepage = primaryHomepage(host);
  const categoryLine = [classificationLabel(host.classification), host.domain]
    .filter(Boolean)
    .join(' · ');

  return (
    <header className={cn('header')}>
      <div className={cn('nameRow')}>
        {showImage ? (
          <img
            className={cn('logo', 'logo__img')}
            src={(logo as { src: string }).src}
            alt=""
            aria-hidden="true"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className={cn('logo')}
            style={{ background: badge.gradient, color: badge.textColor }}
            aria-hidden="true"
          >
            {badge.initial}
          </div>
        )}
        <h1 className={cn('name')}>
          {host.host_name}
          {host.verified && (
            <span className={cn('verified')} aria-label="확인된 주최">
              ✓
            </span>
          )}
        </h1>
      </div>

      <div className={cn('meta')}>
        <span>{categoryLine}</span>
        {host.meta_location && (
          <>
            <span className={cn('meta__dot')}>•</span>
            <span>{host.meta_location}</span>
          </>
        )}
        {host.meta_history && (
          <>
            <span className={cn('meta__dot')}>•</span>
            <span>{host.meta_history}</span>
          </>
        )}
        {homepage && (
          <>
            <span className={cn('meta__dot')}>•</span>
            <a
              className={cn('meta__link')}
              href={homepage.url}
              target="_blank"
              rel="noreferrer"
            >
              {homepage.url.replace(/^https?:\/\//, '')} ↗
            </a>
          </>
        )}
      </div>

      {host.chips.length > 0 && (
        <div className={cn('chips')}>
          {host.chips.map((chip) => (
            <span
              key={chip.label}
              className={cn('chip', {
                chip__live: chip.variant === 'live',
              })}
            >
              {chip.label}
            </span>
          ))}
        </div>
      )}

      {descriptionHtml && (
        <div className={cn('descWrap')}>
          <div
            ref={descRef}
            className={cn('desc', {
              desc__clamped: !expanded,
              desc__faded: !expanded && clamped,
            })}
          >
            <div
              ref={descBodyRef}
              className={cn('descBody')}
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
          {/* 실제로 잘릴 때만 버튼을 보여준다 */}
          {clamped && (
            <button
              type="button"
              className={cn('descToggle')}
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
            >
              {expanded ? '접기' : '더보기'}
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default HostHeader;
