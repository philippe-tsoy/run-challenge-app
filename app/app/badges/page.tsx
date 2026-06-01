import { BadgeGallery } from "@/features/badges/components/badge-gallery";

export default function BadgesPage() {
  return (
    <main className="flex min-h-dvh flex-col gap-4 pb-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Badges</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your fellowship achievements
        </p>
      </header>
      <BadgeGallery />
    </main>
  );
}
