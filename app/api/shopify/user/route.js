import { supabaseAdmin } from "@/supabase/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");
  if (!shop) {
    return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('shopify_users')
    .select('*')
    .eq('shop', shop)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}