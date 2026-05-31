import { HomeGreetingScreen } from "@/components/home/home-greeting-screen";
import { AppShell } from "@/components/layout/app-shell";

export default function HomePage() {
  return (
    <AppShell>
      <HomeGreetingScreen />
    </AppShell>
  );
}
