import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");
  if (!shop) {
    return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
  }
  const clientId = process.env.SHOPIFY_API_KEY || "";
  const redirectUri = process.env.SHOPIFY_REDIRECT_URI || "";
  const scope = "read_checkouts,read_customers,write_discounts";
  const url = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&state=nonce&grant_options[]=per-user`;
  return NextResponse.redirect(url);
}