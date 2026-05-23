import { InMemoryEventBus } from "@/shared/event-bus/in-memory-event-bus";
import type { LedgerDomainEvent } from "@/modules/accounting/domain/events";

export const ledgerEventBus = new InMemoryEventBus<LedgerDomainEvent>();
