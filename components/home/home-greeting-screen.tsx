import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HomeGreetingScreen() {
  return (
    <main className="h-full bg-[#f4f5f8] px-6 py-8 md:px-10">
      <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-[#d4d7dc] bg-white p-8">
          <div className="mb-6 flex flex-col gap-4">
            <Image src="/logo-big.png" alt="Simple" width={180} height={180} priority />
            <h2 className="text-4xl font-semibold text-[#21262a]">
              Hello, John. Welcome to Simple.
            </h2>
          </div>
          <p className="mx-auto max-w-2xl text-lg text-[#393a3d]">
          This is your home screen. From here, you can quickly navigate to the register and start working on your transactions.
          </p>
        </section>

        <section>
          <article className="h-full w-full rounded-xl border border-[#d4d7dc] bg-white p-6">
            <div className="mb-3 inline-flex rounded-lg bg-[#e7efea] p-2 text-[#108a00]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[#21262a]">Start your workflow</h2>
            <p className="mb-4 text-[#393a3d]">
              First recommended task: register a transaction to start building your accounting history.
            </p>
            <div className="mb-5 rounded-lg bg-[#f4f5f8] p-4 text-sm text-[#393a3d]">
              <p>- Select transaction type</p>
              <p>- Complete amount and associated account</p>
              <p>- Save and validate the balance</p>
            </div>
            <Link href="/register" className="inline-flex items-center gap-1 text-[#005f9e] hover:underline">
              Go to Register <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        </section>
      </div>
    </main>
  );
}
