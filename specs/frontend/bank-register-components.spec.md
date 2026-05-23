# Bank Register Components Specification

## Overview

This document defines the React component architecture
for the Bank Register screen.

It translates the UI specification into implementable components
for a Next.js + TypeScript frontend.

---

# Core Principle

## Component = Domain View

Each component MUST map to:

- a domain concept
- or a service contract
- or a ledger event stream

No UI-only components without domain meaning.

---

# COMPONENT ARCHITECTURE

The Bank Register screen is composed of 5 main layers:

---

## 1. Page Layer

### BankRegisterPage

Entry point of the screen.

Responsibilities:

- load selected account
- initialize services
- connect event listeners
- orchestrate layout

```tsx id="cmp1"
function BankRegisterPage() {
  return (
    <BankRegisterProvider>
      <BankRegisterLayout />
    </BankRegisterProvider>
  );
}