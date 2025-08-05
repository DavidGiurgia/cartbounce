import { NextResponse } from "next/server";
import axios from "axios";
import { supabaseAdmin } from "@/supabase/supabaseAdmin";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");
  const code = searchParams.get("code");
  const isEmbedded = req.headers.get('sec-fetch-dest') === 'iframe';

  if (!shop || !code) {
    return NextResponse.json({ 
      error: "Missing shop or code parameter", 
      type: "param_error" 
    }, { status: 400 });
  }

  const clientId = process.env.SHOPIFY_API_KEY;
  const clientSecret = process.env.SHOPIFY_API_SECRET;
  const redirectUri = process.env.SHOPIFY_REDIRECT_URI;

  try {
    // 1. Obține access token
    const response = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      },
      { headers: { "Content-Type": "application/json" } }
    );
    const accessToken = response.data.access_token;

    // 2. Obține detalii magazin
    const shopDetailsRes = await axios.get(
      `https://${shop}/admin/api/2023-07/shop.json`,
      { headers: { "X-Shopify-Access-Token": accessToken } }
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

    if (error) throw new Error("Database error: " + error.message);

    // 4. Redirecționare inteligentă
    if (isEmbedded) {
      // Rămâi în iframe-ul Shopify Admin
      const appEmbedUrl = `https://${shop}/admin/apps/${clientId}`;
      return NextResponse.redirect(appEmbedUrl);
    } else {
      // Fallback pentru browser normal (dezvăluirea aplicației)
      return NextResponse.redirect(`https://${shop}/admin/apps/${clientId}`);
    }
    
  } catch (error) {
    console.error("Auth error:", error.message);
    return NextResponse.json(
      { error: "Authentication failed", details: error.message },
      { status: 500 }
    );
  }
}