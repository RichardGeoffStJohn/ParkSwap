"use client";

import { useEffect, useState, useCallback } from "react";
import Nav from "@/components/nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SwapRequest {
  id: string;
  date: string;
  reason: string | null;
  status: "OPEN" | "ACCEPTED" | "CANCELLED";
  requesterId: string;
  acceptorId: string | null;
  requester: { name: string; unitNumber: string };
  acceptor: { name: string; unitNumber: string; spotIdentifier: string | null } | null;
}

interface Props {
  userId: string;
  userName: string;
  hasAccessibleSpot: boolean;
  spotIdentifier: string | null;
  isAdmin: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function statusBadge(status: string) {
  if (status === "OPEN") return <Badge variant="secondary">Open</Badge>;
  if (status === "ACCEPTED") return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>;
  return <Badge variant="outline">Cancelled</Badge>;
}

export default function DashboardClient({ userId, userName, hasAccessibleSpot, spotIdentifier, isAdmin }: Props) {
  const [mySwaps, setMySwaps] = useState<SwapRequest[]>([]);
  const [openRequests, setOpenRequests] = useState<SwapRequest[]>([]);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [myRes, openRes] = await Promise.all([
      fetch("/api/me/swaps"),
      fetch("/api/requests"),
    ]);
    if (myRes.ok) setMySwaps(await myRes.json());
    if (openRes.ok) setOpenRequests(await openRes.json());
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function acceptRequest(id: string) {
    setAccepting(id);
    const res = await fetch(`/api/requests/${id}/accept`, { method: "PATCH" });
    if (res.ok) await fetchData();
    else {
      const data = await res.json();
      alert(data.error || "Failed to accept request");
    }
    setAccepting(null);
  }

  async function cancelRequest(id: string) {
    setCancelling(id);
    const res = await fetch(`/api/requests/${id}/cancel`, { method: "PATCH" });
    if (res.ok) await fetchData();
    setCancelling(null);
  }

  const myOpenRequests = mySwaps.filter((s) => s.requesterId === userId && s.status === "OPEN");
  const myAcceptedSwaps = mySwaps.filter((s) => s.status === "ACCEPTED");
  const boardRequests = openRequests.filter((r) => r.requesterId !== userId);

  return (
    <div className="min-h-screen">
      <Nav isAdmin={isAdmin} hasAccessibleSpot={hasAccessibleSpot} userName={userName} />

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        {hasAccessibleSpot && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            You hold accessible spot <strong>{spotIdentifier ?? "—"}</strong> with all-day access during construction.
          </div>
        )}

        {myAcceptedSwaps.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Your confirmed swaps</h2>
            <div className="space-y-3">
              {myAcceptedSwaps.map((swap) => {
                const isRequester = swap.requesterId === userId;
                return (
                  <Card key={swap.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">{formatDate(swap.date)}</p>
                          {isRequester ? (
                            <p className="text-sm text-gray-600">
                              Swap granted by <strong>{swap.acceptor?.name}</strong> (Unit {swap.acceptor?.unitNumber}) —
                              use spot <strong>{swap.acceptor?.spotIdentifier ?? "TBD"}</strong>
                            </p>
                          ) : (
                            <p className="text-sm text-gray-600">
                              You gave your spot to <strong>{swap.requester.name}</strong> (Unit {swap.requester.unitNumber})
                            </p>
                          )}
                          {swap.reason && <p className="mt-1 text-sm text-gray-500">Reason: {swap.reason}</p>}
                        </div>
                        {statusBadge(swap.status)}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {!hasAccessibleSpot && myOpenRequests.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Your pending requests</h2>
            <div className="space-y-3">
              {myOpenRequests.map((req) => (
                <Card key={req.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{formatDate(req.date)}</p>
                        {req.reason && <p className="text-sm text-gray-500">Reason: {req.reason}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(req.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          disabled={cancelling === req.id}
                          onClick={() => cancelRequest(req.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {hasAccessibleSpot && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Open swap requests</CardTitle>
              </CardHeader>
              <CardContent>
                {boardRequests.length === 0 ? (
                  <p className="text-sm text-gray-500">No open requests right now.</p>
                ) : (
                  <div className="space-y-3">
                    {boardRequests.map((req) => (
                      <div key={req.id} className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium">{formatDate(req.date)}</p>
                          <p className="text-sm text-gray-600">
                            {req.requester.name} — Unit {req.requester.unitNumber}
                          </p>
                          {req.reason && <p className="text-sm text-gray-500 italic">{req.reason}</p>}
                        </div>
                        <Button
                          size="sm"
                          disabled={accepting === req.id}
                          onClick={() => acceptRequest(req.id)}
                        >
                          {accepting === req.id ? "Accepting…" : "Accept"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {!hasAccessibleSpot && boardRequests.length === 0 && myOpenRequests.length === 0 && myAcceptedSwaps.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No active swaps. Need access to your car on a specific day?</p>
            <a href="/requests/new" className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
              Request a swap
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
