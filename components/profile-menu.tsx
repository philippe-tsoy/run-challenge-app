import Link from "next/link";
import { User } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ProfileMenu() {
  return (
    <Button variant="ghost" size="icon" asChild>
      <Link href="/app/challenges" aria-label="Profile">
        <User className="size-5" aria-hidden />
      </Link>
    </Button>
  );
}
