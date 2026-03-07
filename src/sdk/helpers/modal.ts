export type WioModalElement = HTMLElement & { open: () => void };

export function openModal(id: string) {
  document.querySelector<WioModalElement>(`wio-modal#${id}`)?.open();
}
