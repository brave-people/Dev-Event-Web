export const blockMouseScroll = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

export const isModalOpen = (current: number, prev: number, modal_id: number): boolean => {
  if (current === modal_id ||
      prev === modal_id) {
    return (true);
  }
  return (false);
}