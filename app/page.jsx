export default function LandingPage() {
  const installLink = "https://admin.shopify.com/oauth/install_custom_app?client_id=df902be93f84a1d20dd115218f3098a8&no_redirect=true&signature=eyJleHBpcmVzX2F0IjoxNzU0OTQzMTExLCJwZXJtYW5lbnRfZG9tYWluIjoidGVzdGNhcnRib3VuY2UubXlzaG9waWZ5LmNvbSIsImNsaWVudF9pZCI6ImRmOTAyYmU5M2Y4NGExZDIwZGQxMTUyMThmMzA5OGE4IiwicHVycG9zZSI6ImN1c3RvbV9hcHAiLCJtZXJjaGFudF9vcmdhbml6YXRpb25faWQiOjE3ODA1MTY4OH0%3D--6d28595f9d4b397e930c4f2dad4b05773ee5b902";
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">CartBounce for Shopify</h1>
      <p className="mb-6">Gestionează coșurile abandonate și trimite emailuri automate pentru clienții tăi Shopify.</p>
      <a
        href={installLink}
        className="bg-green-600 text-white rounded px-6 py-3 font-semibold shadow hover:bg-green-700 transition"
      >
        Instalează CartBounce în Shopify
      </a>
    </main>
  );
}