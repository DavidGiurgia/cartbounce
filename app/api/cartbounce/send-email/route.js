import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/supabase/supabaseAdmin";
import axios from "axios";
// import { sendEmail } from "@/lib/sendEmail"; // implementează cu SendGrid/Mailgun/Resend

export async function POST(req) {
  const body = await req.json();
  const { shop, checkout_id, email } = body;
  if (!shop || !checkout_id || !email)
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

  // Ia access_token din DB
  const { data: user, error } = await supabaseAdmin
    .from('shopify_users')
    .select('access_token')
    .eq('shop', shop)
    .single();
  if (error || !user)
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  // Creează discount în Shopify
  const priceRuleRes = await axios.post(
    `https://${shop}/admin/api/2023-07/price_rules.json`,
    {
      price_rule: {
        title: `CartBounce-${checkout_id}`,
        target_type: "line_item",
        target_selection: "all",
        allocation_method: "across",
        value_type: "percentage",
        value: "-10.0", // 10% discount
        customer_selection: "all",
        starts_at: new Date().toISOString()
      }
    },
    { headers: { "X-Shopify-Access-Token": user.access_token } }
  );
  const priceRuleId = priceRuleRes.data.price_rule.id;

  const discountRes = await axios.post(
    `https://${shop}/admin/api/2023-07/discount_codes.json`,
    {
      discount_code: {
        code: `BOUNCE10`,
        price_rule_id: priceRuleId
      }
    },
    { headers: { "X-Shopify-Access-Token": user.access_token } }
  );
  const discountCode = discountRes.data.discount_code.code;

  // Trimite email (pseudo-cod, implementează cu providerul tău)
  // await sendEmail(email, `Codul tău de discount: ${discountCode}`);

  // Salvează în DB
  await supabaseAdmin.from('sent_emails').insert([{
    shop,
    checkout_id,
    email,
    discount_code: discountCode,
    sent_at: new Date().toISOString()
  }]);

  return NextResponse.json({ success: true, discountCode });
}