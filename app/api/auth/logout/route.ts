import { type NextRequest } from "next/server";

import {
  createRouteHandlerClient,
  emptyWithCookies,
} from "@/lib/supabase/route-handler";

export async function POST(request: NextRequest) {
  const { supabase, getResponse } = createRouteHandlerClient(request);

  await supabase.auth.signOut();

  return emptyWithCookies(getResponse(), { status: 204 });
}
