type IconName =
  | 'bookmark'
  | 'share'
  | 'search'
  | 'chevron'
  | 'back'
  | 'rows'
  | 'calendar'
  | 'x'
  | 'out'
  | 'zoom'
  | 'pin'
  | 'globe'
  | 'info'
  | 'mail'
  | 'user';

interface TimelineIconProps {
  name: IconName;
  size?: number;
  className?: string;
}

const renderShape = (name: IconName) => {
  switch (name) {
    case 'bookmark':
      return <path d="M6.5 4h11v16.5l-5.5-3.8-5.5 3.8z" />;
    case 'share':
      return <path d="M12 3.5v11M7.5 8L12 3.5 16.5 8M5 13.5V20h14v-6.5" />;
    case 'search':
      return (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.6-3.6" />
        </>
      );
    case 'chevron':
      return <path d="M9 5l7 7-7 7" />;
    case 'back':
      return <path d="M15 5l-7 7 7 7" />;
    case 'rows':
      return (
        <>
          <path d="M9 6.5h11M9 12h11M9 17.5h11" />
          <circle cx="4.6" cy="6.5" r=".8" fill="currentColor" />
          <circle cx="4.6" cy="12" r=".8" fill="currentColor" />
          <circle cx="4.6" cy="17.5" r=".8" fill="currentColor" />
        </>
      );
    case 'calendar':
      return (
        <>
          <rect x="3.5" y="5" width="17" height="15" rx="3" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </>
      );
    case 'x':
      return <path d="M6 6l12 12M18 6L6 18" />;
    case 'out':
      return <path d="M8 16L18 6M9.5 6H18v8.5" />;
    case 'zoom':
      return (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.6-3.6M11 8v6M8 11h6" />
        </>
      );
    case 'pin':
      return (
        <>
          <path d="M12 21s7-6.2 7-11.5a7 7 0 00-14 0C5 14.8 12 21 12 21z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </>
      );
    case 'globe':
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z" />
        </>
      );
    case 'info':
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 11.2v5.3" />
          <circle cx="12" cy="7.9" r=".7" fill="currentColor" />
        </>
      );
    case 'mail':
      return (
        <>
          <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
          <path d="M4.5 8l7.5 5 7.5-5" />
        </>
      );
    case 'user':
      return (
        <>
          <circle cx="12" cy="8.5" r="3.6" />
          <path d="M5 19.5c.9-3.4 3.7-5.6 7-5.6s6.1 2.2 7 5.6" />
        </>
      );
    default:
      return null;
  }
};

function TimelineIcon({ name, size = 20, className }: TimelineIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {renderShape(name)}
    </svg>
  );
}

export default TimelineIcon;
