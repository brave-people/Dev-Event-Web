import { HostClassification } from 'model/host';

const LOGO_GRADIENTS = [
  'linear-gradient(135deg,#FF804E,#FF0073)',
  'linear-gradient(135deg,#00B7F8,#006EF7)',
  'linear-gradient(135deg,#AF7DEB,#7A0CFF)',
  'linear-gradient(135deg,#FFE600,#FFB900)',
  'linear-gradient(135deg,#34B7F9,#87E8DF)',
  'linear-gradient(135deg,#00C73C,#03A731)',
  'linear-gradient(135deg,#5B3F9F,#7A0CFF)',
  'linear-gradient(135deg,#FF6B6B,#FF0073)',
];

const LIGHT_GRADIENTS = new Set<string>([
  'linear-gradient(135deg,#FFE600,#FFB900)',
]);

const hashCode = (key: string): number => {
  let sum = 0;
  for (let i = 0; i < key.length; i++) {
    sum = (sum + key.charCodeAt(i)) % 997;
  }
  return sum;
};

export type HostLogo =
  | { kind: 'image'; src: string }
  | { kind: 'fallback'; initial: string; gradient: string; textColor: string };

export const resolveHostLogo = (host: {
  host_name: string;
  logo_image_link: string | null;
}): HostLogo => {
  if (host.logo_image_link) {
    return { kind: 'image', src: host.logo_image_link };
  }
  const gradient = LOGO_GRADIENTS[hashCode(host.host_name) % LOGO_GRADIENTS.length];
  const textColor = LIGHT_GRADIENTS.has(gradient) ? '#000040' : '#ffffff';
  const initial = host.host_name.trim().charAt(0).toUpperCase() || '?';
  return { kind: 'fallback', initial, gradient, textColor };
};

const CLASSIFICATION_LABEL: Record<HostClassification, string> = {
  COMPANY: '기업',
  COMMUNITY: '커뮤니티',
  ACADEMIC: '학회/연구소',
  GOVERNMENT: '정부/공공',
  EDUCATION: '교육',
  MEDIA: '미디어',
};

export const classificationLabel = (c: HostClassification): string =>
  CLASSIFICATION_LABEL[c] ?? '기타';

export const CLASSIFICATION_ORDER: HostClassification[] = [
  'COMPANY',
  'COMMUNITY',
  'ACADEMIC',
  'GOVERNMENT',
  'EDUCATION',
  'MEDIA',
];
