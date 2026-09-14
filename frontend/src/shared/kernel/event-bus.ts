type EventHandler = (payload: unknown) => void;

const listeners = new Map<string, Set<EventHandler>>();

export const eventBus = {
  on(event: string, handler: EventHandler): void {
    const set = listeners.get(event) ?? new Set<EventHandler>();
    set.add(handler);
    listeners.set(event, set);
  },
  off(event: string, handler: EventHandler): void {
    listeners.get(event)?.delete(handler);
  },
  emit(event: string, payload?: unknown): void {
    listeners.get(event)?.forEach((handler) => {
      handler(payload);
    });
  },
};
