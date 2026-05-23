import type { ServiceContainer } from "@/modules/accounting/application/contracts";
import { createMockAccountingServices } from "@/modules/accounting/mocks/mock-services";

let container: ServiceContainer | null = null;

export function getServiceContainer(): ServiceContainer {
  if (!container) {
    container = createMockAccountingServices();
  }
  return container;
}
