"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SwapRequest {
  id: string;
  date: string;
  reason: string | null;
  status: "OPEN" | "ACCEPTED" | "CANCELLED";
  createdAt: string;
  requester: { name: string; unitNumber: string };
  acceptor: { name: string; unitNumber: string; spotIdentifier: string | null } | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-CA", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function statusBadge(status: string) {
  if (status === "OPEN") return <Badge variant="secondary">Open</Badge>;
  if (status === "ACCEPTED") return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>;
  return <Badge variant="outline">Cancelled</Badge>;
}

export default function AdminSwapsClient({ userName }: { userName: string }) {
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);

  useEffect(() => {
    fetch("/api/admin/swaps")
      .then((r) => r.json())
      .then(setSwaps);
  }, []);

  return (
    <div className="min-h-screen">
      <Nav isAdmin userName={userName} hasAccessibleSpot={false} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-xl font-semibold">All Swap Requests</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{swaps.length} total requests</CardTitle>
          </CardHeader>
          <CardContent>
            {swaps.length === 0 ? (
              <p className="text-sm text-gray-500">No swap requests yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4 font-medium">Date</th>
                    <th className="pb-2 pr-4 font-medium">Requester</th>
                    <th className="pb-2 pr-4 font-medium">Acceptor</th>
                    <th className="pb-2 pr-4 font-medium">Reason</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {swaps.map((swap) => (
                    <tr key={swap.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{formatDate(swap.date)}</td>
                      <td className="py-2 pr-4">{swap.requester.name} (Unit {swap.requester.unitNumber})</td>
                      <td className="py-2 pr-4">
                        {swap.acceptor
                          ? `${swap.acceptor.name} — spot ${swap.acceptor.spotIdentifier ?? "?"}`
                          : <span className="text-gray-400">—</span>
                        }
                      </td>
                      <td className="py-2 pr-4 text-gray-500">{swap.reason ?? "—"}</td>
                      <td className="py-2">{statusBadge(swap.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
