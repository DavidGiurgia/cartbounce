import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/supabase/supabaseAdmin";
import axios from "axios";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");
  if (!shop) return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });

  // Ia access_token din DB
  const { data: user, error } = await supabaseAdmin
    .from('shopify_users')
    .select('access_token')
    .eq('shop', shop)
    .single();
  if (error || !user) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  // Ia coșurile abandonate din Shopify
  const checkoutsRes = await axios.get(
    `https://${shop}/admin/api/2023-07/checkouts.json?status=abandoned`,
    { headers: { "X-Shopify-Access-Token": user.access_token } }
  );
  const checkouts = checkoutsRes.data.checkouts;

  // Poți salva în Supabase (opțional)
  for (const c of checkouts) {
    await supabaseAdmin.from('abandoned_checkouts').upsert([{
      shop,
      checkout_id: c.id,
      email: c.email,
      total_price: c.total_price,
      products: JSON.stringify(c.line_items),
      abandoned_at: c.created_at
    }], { onConflict: ['checkout_id'] });
  }

  return NextResponse.json(checkouts);
}