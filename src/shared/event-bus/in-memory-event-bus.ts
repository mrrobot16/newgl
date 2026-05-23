type EventEnvelope = {
  eventType: string;
};

type EventHandler<T extends EventEnvelope> = (event: T) => void;

export class InMemoryEventBus<T extends EventEnvelope> {
  private handlers = new Map<string, Set<EventHandler<T>>>();

  emit(event: T): void {
    this.handlers.get(event.eventType)?.forEach((handler) => {
      handler(event);
    });

    this.handlers.get("*")?.forEach((handler) => {
      handler(event);
    });
  }

  subscribe(eventType: T["eventType"] | "*", handler: EventHandler<T>): () => void {
    const existingHandlers = this.handlers.get(eventType) ?? new Set<EventHandler<T>>();
    existingHandlers.add(handler);
    this.handlers.set(eventType, existingHandlers);

    return () => {
      existingHandlers.delete(handler);
      if (existingHandlers.size === 0) {
        this.handlers.delete(eventType);
      }
    };
  }
}
