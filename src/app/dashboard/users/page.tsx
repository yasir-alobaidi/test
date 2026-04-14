"use client";

import React, { useCallback, useEffect, useState, useTransition } from "react";
import { Plus, Search } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/shared/ui/table";
import { BaseModal } from "@/components/shared/ui/modal";
import { fetchUsers } from "@/modules/users/actions";
import type { User } from "@/modules/users/types";
import { UserActionsDropdown, UserForm } from "@/modules/users/components";

// ---------------------------------------------------------------------------
// Column definitions – module-specific
// ---------------------------------------------------------------------------
const columns: ColumnDef<User>[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role", render: (row) => <span className="capitalize">{row.role}</span> },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
          row.status === "active"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {row.status}
      </span>
    ),
  },
  { key: "createdAt", header: "Created" },
];

// ---------------------------------------------------------------------------
// Page component – assembles the Compound Table with module-specific slots
// ---------------------------------------------------------------------------
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const loadUsers = useCallback(() => {
    startTransition(async () => {
      const result = await fetchUsers();
      setUsers(result.users);
      setError(result.error);
    });
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your organization&apos;s user accounts.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {/* Toolbar – module-specific slot */}
      <DataTable.Toolbar>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus size={16} />
          Add User
        </button>
      </DataTable.Toolbar>

      {/* Compound DataTable */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        getRowKey={(row) => row.id}
      >
        <DataTable.Header />
        <DataTable.Body<User>
          renderActions={(row) => (
            <DataTable.ActionCell>
              <UserActionsDropdown user={row} onDeleted={loadUsers} />
            </DataTable.ActionCell>
          )}
        />
      </DataTable>

      {isPending && (
        <div className="mt-4 text-sm text-gray-400 text-center">Loading…</div>
      )}

      {/* Create User Modal */}
      <BaseModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New User"
      >
        <UserForm
          onSuccess={() => {
            setIsModalOpen(false);
            loadUsers();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </BaseModal>
    </div>
  );
}
