import { NextResponse } from "next/server";
import axios from "axios";
import { supabaseAdmin } from "@/supabase/supabaseAdmin";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");
  const code = searchParams.get("code");
  if (!shop || !code) {
    return NextResponse.json({ error: "Missing shop or code parameter", type: "param_error" }, { status: 400 });
  }

  const clientId = process.env.SHOPIFY_API_KEY;
  const clientSecret = process.env.SHOPIFY_API_SECRET;
  const redirectUri = process.env.SHOPIFY_REDIRECT_URI;

  try {
    // 1. Schimbă codul pe access_token
    const response = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );
    const accessToken = response.data.access_token;

    // 2. Ia detalii shop
    const shopDetailsRes = await axios.get(
      `https://${shop}/admin/api/2023-07/shop.json`,
      {
        headers: { "X-Shopify-Access-Token": accessToken }
      }
    );
    const shopInfo = shopDetailsRes.data.shop;

    // 3. Salvează în Supabase
    const { error } = await supabaseAdmin
      .from('shopify_users')
      .upsert([{
        shop,
        access_token: accessToken,
        owner_email: shopInfo.email,
        shop_name: shopInfo.name,
        installed_at: new Date().toISOString()
      }], { onConflict: ['shop'] });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "DB error", type: "db_error" }, { status: 500 });
    }

    // 4. Redirect către dashboard (URL absolut!)
    return NextResponse.redirect(`https://cartbounce.vercel.app/dashboard?shop=${shop}`);
  } catch (error) {
    let errorType = "unknown";
    let errorMsg = "OAuth error";
    if (error.response) {
      errorType = error.response.data?.error || error.response.statusText;
      errorMsg = error.response.data?.error_description || error.response.data?.message || error.message;
    } else {
      errorMsg = error.message;
    }
    console.error("OAuth error:", { type: errorType, message: errorMsg, data: error.response?.data });
    return NextResponse.json({ error: errorMsg, type: errorType, data: error.response?.data }, { status: 500 });
  }
}