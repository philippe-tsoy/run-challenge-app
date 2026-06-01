"use client";

import { useQuery } from "@tanstack/react-query";

import { listBadgeCatalog, listUserBadges } from "@/features/badges/lib/api";

export function useUserBadges() {
  return useQuery({
    queryKey: ["badges", "me"],
    queryFn: listUserBadges,
  });
}

export function useBadgeCatalog() {
  return useQuery({
    queryKey: ["badges", "catalog"],
    queryFn: listBadgeCatalog,
  });
}
