import type { LedgerPosting, TransactionType } from "@/modules/accounting/domain/models";

export type LedgerDomainEvent =
  | {
      eventType: "TransactionCreated";
      transactionId: string;
      transactionType: TransactionType;
      status: "DRAFT";
      createdAt: string;
    }
  | {
      eventType: "TransactionPosted";
      transactionId: string;
      postedAt: string;
    }
  | {
      eventType: "TransactionVoided";
      transactionId: string;
      voidedAt: string;
    }
  | {
      eventType: "TransactionReversed";
      transactionId: string;
      reversedAt: string;
      referenceOriginalTransactionId: string;
    }
  | {
      eventType: "LedgerPostingsCreated";
      transactionId: string;
      postings: LedgerPosting[];
      createdAt: string;
    }
  | {
      eventType: "LedgerVoidCreated";
      transactionId: string;
      createdAt: string;
    }
  | {
      eventType: "LedgerReversalCreated";
      transactionId: string;
      createdAt: string;
    }
  | {
      eventType: "AccountBalanceUpdated";
      accountId: string;
      currentBalance: number;
      updatedAt: string;
    };

export type LedgerEventType = LedgerDomainEvent["eventType"];
