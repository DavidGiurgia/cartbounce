import "./globals.css";

export const metadata = {
  title: "CartBounce",
  description: "CartBounce for Shopify",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
