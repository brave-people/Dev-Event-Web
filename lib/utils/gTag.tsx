interface EventParams {
  event_label?: string;
  event_category?: string;
  action: string;
}
declare global {
  interface Window {
    gtag: any;
  }
}
export const GA_TRACKING_ID = 'G-BM8BFNJ65P';

export const pageview = (url: URL) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};
export const event = ({ action, event_category, event_label }: EventParams) => {
  window.gtag('event', action, {
    event_category: event_category,
    event_label: event_label,
  });
};
