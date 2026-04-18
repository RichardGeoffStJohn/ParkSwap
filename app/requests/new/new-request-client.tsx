"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  userName: string;
  isAdmin: boolean;
  hasAccessibleSpot: boolean;
}

export default function NewRequestClient({ userName, isAdmin, hasAccessibleSpot }: Props) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, reason: reason || undefined }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create request");
    }
  }

  return (
    <div className="min-h-screen">
      <Nav isAdmin={isAdmin} hasAccessibleSpot={hasAccessibleSpot} userName={userName} />
      <main className="mx-auto max-w-md px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Request a Swap</CardTitle>
            <CardDescription>
              Pick the date you need access to your car. Any accessible spot holder who is free that day can accept your request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="date">Date needed</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reason">Reason <span className="text-gray-400">(optional)</span></Label>
                <Input
                  id="reason"
                  type="text"
                  placeholder="e.g. medical appointment"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Submitting…" : "Submit request"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
