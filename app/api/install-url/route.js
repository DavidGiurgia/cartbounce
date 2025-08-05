export async function GET() {
    return Response.json({
      url: process.env.SHOPIFY_APP_URI
    });
  }