import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";

type RegisterRouteLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RegisterRouteLayout({ children }: RegisterRouteLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
