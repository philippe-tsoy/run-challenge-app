import { type NextRequest } from "next/server";

import { getSessionProfile } from "@/lib/auth/profile";
import {
  createRouteHandlerClient,
  jsonWithCookies,
} from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const { supabase, getResponse } = createRouteHandlerClient(request);

  const user = await getSessionProfile(supabase);

  return jsonWithCookies({ user }, getResponse());
}
