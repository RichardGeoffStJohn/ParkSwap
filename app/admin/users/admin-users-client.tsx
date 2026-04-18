"use client";

import { useEffect, useState, useCallback } from "react";
import Nav from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface User {
  id: string;
  email: string;
  name: string;
  unitNumber: string;
  hasAccessibleSpot: boolean;
  spotIdentifier: string | null;
  isAdmin: boolean;
  createdAt: string;
}

interface Props {
  currentUserId: string;
  userName: string;
}

const BLANK_FORM = {
  email: "",
  name: "",
  unitNumber: "",
  password: "",
  hasAccessibleSpot: false,
  spotIdentifier: "",
};

export default function AdminUsersClient({ currentUserId, userName }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function openNew() {
    setEditing(null);
    setForm({ ...BLANK_FORM });
    setFormError("");
    setDialogOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setForm({
      email: user.email,
      name: user.name,
      unitNumber: user.unitNumber,
      password: "",
      hasAccessibleSpot: user.hasAccessibleSpot,
      spotIdentifier: user.spotIdentifier ?? "",
    });
    setFormError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    setFormError("");
    setSaving(true);

    const body = {
      ...form,
      spotIdentifier: form.hasAccessibleSpot ? form.spotIdentifier : null,
      password: form.password || undefined,
    };

    const res = editing
      ? await fetch(`/api/admin/users/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

    setSaving(false);

    if (res.ok) {
      await fetchUsers();
      setDialogOpen(false);
    } else {
      const data = await res.json();
      setFormError(data.error || "Failed to save");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove ${name}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) await fetchUsers();
  }

  return (
    <div className="min-h-screen">
      <Nav isAdmin userName={userName} hasAccessibleSpot={false} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Residents</h1>
          <Button onClick={openNew}>Add resident</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All residents ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-sm text-gray-500">No residents yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Unit</th>
                    <th className="pb-2 pr-4 font-medium">Email</th>
                    <th className="pb-2 pr-4 font-medium">Spot</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        {user.name}
                        {user.isAdmin && (
                          <Badge variant="outline" className="ml-2 text-xs">admin</Badge>
                        )}
                      </td>
                      <td className="py-2 pr-4">{user.unitNumber}</td>
                      <td className="py-2 pr-4">{user.email}</td>
                      <td className="py-2 pr-4">
                        {user.hasAccessibleSpot ? (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            {user.spotIdentifier ?? "Accessible"}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-2 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>Edit</Button>
                        {user.id !== currentUserId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(user.id, user.name)}
                          >
                            Remove
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit resident" : "Add resident"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Unit number</Label>
                <Input value={form.unitNumber} onChange={(e) => setForm({ ...form, unitNumber: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>{editing ? "New password (leave blank to keep)" : "Password"}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editing ? "Leave blank to keep current" : ""}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="accessible"
                type="checkbox"
                checked={form.hasAccessibleSpot}
                onChange={(e) => setForm({ ...form, hasAccessibleSpot: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="accessible">Has accessible spot (all-day access)</Label>
            </div>
            {form.hasAccessibleSpot && (
              <div className="space-y-1">
                <Label>Spot identifier (e.g. A-12)</Label>
                <Input
                  value={form.spotIdentifier}
                  onChange={(e) => setForm({ ...form, spotIdentifier: e.target.value })}
                  placeholder="A-12"
                />
              </div>
            )}
            {formError && <p className="text-sm text-red-600">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
