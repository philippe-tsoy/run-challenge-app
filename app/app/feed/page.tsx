import { Suspense } from "react";



import { FeedPageClient } from "@/features/feed/components/feed-page-client";



export default function FeedPage() {

  return (

    <main className="flex min-h-dvh flex-col gap-6 pb-6">

      <header>

        <h1 className="text-2xl font-semibold tracking-tight">Activity feed</h1>

        <p className="text-muted-foreground mt-1 text-sm">

          Challenge activity for runs and milestones.

        </p>

      </header>



      <Suspense

        fallback={

          <p className="text-muted-foreground text-sm">Loading feed...</p>

        }

      >

        <FeedPageClient />

      </Suspense>

    </main>

  );

}

