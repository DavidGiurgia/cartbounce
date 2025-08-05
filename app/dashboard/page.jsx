"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const shop = searchParams.get("shop");
  const router = useRouter();
  const [shopInfo, setShopInfo] = useState(null);
  const [checkouts, setCheckouts] = useState([]);
  const [sending, setSending] = useState(null);

  const scan = async () => {
    const res = await fetch(`/api/cartbounce/scan?shop=${shop}`);
    const data = await res.json();
    setCheckouts(data);
  };

  const sendEmail = async (checkout_id, email) => {
    setSending(checkout_id);
    const res = await fetch(`/api/cartbounce/send-email`, {
      method: "POST",
      body: JSON.stringify({ shop, checkout_id, email }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setSending(null);
    alert(`Email trimis! Cod discount: ${data.discountCode}`);
  };

  useEffect(() => {
    if (!shop) {
      // Dacă nu ai shop-ul, nu ai cum să identifici userul
      router.push("/");
      return;
    }
    fetch(`/api/shopify/user?shop=${shop}`)
      .then((res) => res.json())
      .then((data) => setShopInfo(data));
  }, [shop]);

  if (!shop) {
    return <div className="p-10 text-red-600">Shop parameter missing!</div>;
  }
  if (!shopInfo) {
    return <div className="p-10">Se încarcă datele magazinului...</div>;
  }

  return (
    <main className="max-w-2xl mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-2">CartBounce Dashboard</h1>
      <div className="mb-4">
        <span className="font-semibold">Magazin:</span> {shopInfo.shop_name}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Email:</span> {shopInfo.owner_email}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Domeniu:</span> {shopInfo.shop}
      </div>
      <div>
        <span className="font-semibold">Instalat la:</span>{" "}
        {new Date(shopInfo.installed_at).toLocaleString()}
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
        onClick={scan}
      >
        Scanează coșuri abandonate
      </button>
      {checkouts.length === 0 ? (
        <div>Nicio coș abandonat găsit.</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th>Email</th>
              <th>Total</th>
              <th>Data</th>
              <th>Trimite email</th>
            </tr>
          </thead>
          <tbody>
            {checkouts.map((c) => (
              <tr key={c.id}>
                <td>{c.email}</td>
                <td>{c.total_price}</td>
                <td>{c.created_at}</td>
                <td>
                  <button
                    disabled={sending === c.id}
                    className="bg-green-600 text-white px-2 py-1 rounded"
                    onClick={() => sendEmail(c.id, c.email)}
                  >
                    Trimite
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
