import React from 'react';
import classNames from 'classnames/bind';
import Link from 'next/link';

import {
  formatLegalDate,
  LegalBlock,
  LegalDocument,
  PRIVACY_PATH,
  Rich,
  TERMS_PATH,
} from 'lib/legal/document';

import style from './LegalDocumentView.module.scss';

const cn = classNames.bind(style);

const DOCS = [
  { path: TERMS_PATH, label: '이용약관' },
  { path: PRIVACY_PATH, label: '개인정보 처리방침' },
] as const;

// 서비스 안 주소는 같은 창, 바깥 주소는 새 창, mailto는 그대로
function RichText({ value }: { value: Rich }) {
  if (typeof value === 'string') return <>{value}</>;
  return (
    <>
      {value.map((part, index) => {
        if (typeof part === 'string') {
          return <React.Fragment key={index}>{part}</React.Fragment>;
        }
        if (part.href.startsWith('/')) {
          return (
            <Link key={index} href={part.href}>
              <a className={cn('link')}>{part.text}</a>
            </Link>
          );
        }
        const external = part.href.startsWith('http');
        return (
          <a
            key={index}
            className={cn('link')}
            href={part.href}
            {...(external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          >
            {part.text}
          </a>
        );
      })}
    </>
  );
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case 'p':
      return (
        <p className={cn('p')}>
          <RichText value={block.text} />
        </p>
      );
    case 'ol':
    case 'ul': {
      const List = block.type;
      return (
        <List className={cn('list', block.type)}>
          {block.items.map((item, index) => (
            <li key={index}>
              <RichText value={item} />
            </li>
          ))}
        </List>
      );
    }
    case 'table':
      // 좁은 화면에서는 표만 옆으로 밀어 본다. 키보드로도 밀 수 있게 포커스를 받는다
      return (
        <div
          className={cn('tableWrap')}
          role="region"
          aria-label={block.caption}
          tabIndex={0}
        >
          <table className={cn('table')}>
            <caption className={cn('caption')}>{block.caption}</caption>
            <thead>
              <tr>
                {block.head.map((cell) => (
                  <th key={cell} scope="col">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>
                      <RichText value={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

function LegalDocumentView({ doc }: { doc: LegalDocument }) {
  return (
    <main className={cn('page')}>
      <header className={cn('head')}>
        <nav className={cn('switch')} aria-label="약관과 정책">
          {DOCS.map(({ path, label }) => (
            <Link key={path} href={path}>
              <a
                className={cn('switchItem', { on: path === doc.path })}
                aria-current={path === doc.path ? 'page' : undefined}
              >
                {label}
              </a>
            </Link>
          ))}
        </nav>
        <h1 className={cn('title')}>{doc.title}</h1>
        <p className={cn('date')}>
          시행일{' '}
          <time dateTime={doc.effectiveDate}>
            {formatLegalDate(doc.effectiveDate)}
          </time>
        </p>
        {doc.intro && (
          <p className={cn('intro')}>
            <RichText value={doc.intro} />
          </p>
        )}
      </header>

      {doc.summary && (
        <section className={cn('summary')} aria-labelledby="legal-summary">
          <h2 id="legal-summary" className={cn('summaryTitle')}>
            한눈에 보기
          </h2>
          <dl className={cn('summaryList')}>
            {doc.summary.map(({ label, value }) => (
              <div key={label} className={cn('summaryRow')}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <div className={cn('layout')}>
        <nav className={cn('toc')} aria-labelledby="legal-toc">
          <h2 id="legal-toc" className={cn('tocTitle')}>
            목차
          </h2>
          <ol className={cn('tocList')}>
            {doc.sections.map((section) => (
              <li key={section.id}>
                <a className={cn('tocLink')} href={`#${section.id}`}>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={cn('body')}>
          {doc.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className={cn('section')}
              aria-labelledby={`${section.id}-title`}
            >
              <h2 id={`${section.id}-title`} className={cn('sectionTitle')}>
                {section.title}
              </h2>
              {section.blocks.map((block, index) => (
                <Block key={index} block={block} />
              ))}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

export default LegalDocumentView;
