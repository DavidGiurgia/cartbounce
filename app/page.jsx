"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart, Rocket } from "lucide-react";

export default function LandingPage() {
  const [installLink, setInstallLink] = useState("#");

  useEffect(() => {
    const fetchInstallUrl = async () => {
      try {
        const response = await fetch('/api/install-url');
        const data = await response.json();
        setInstallLink(data.url);
      } catch (error) {
        console.error("Failed to fetch install URL:", error);
      }
    };

    fetchInstallUrl();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">CartBounce for Shopify</CardTitle>
          <CardDescription className="text-gray-600">
            Recover abandoned carts and boost sales with automated discount emails
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            onClick={() => window.open(installLink, "_blank")}
            className="w-full"
            size="lg"
            disabled={installLink === "#"}
          >
            <Rocket className="mr-2 h-4 w-4" />
            {installLink === "#" ? "Loading..." : "Get started for free"}
          </Button>
        </CardContent>

      </Card>
    </main>
  );
}