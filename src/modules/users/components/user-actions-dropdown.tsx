"use client";

import React, { useState, useTransition } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { deleteUser } from "@/modules/users/actions";
import type { User } from "@/modules/users/types";

interface UserActionsDropdownProps {
  user: User;
  onDeleted: () => void;
}

export function UserActionsDropdown({
  user,
  onDeleted,
}: UserActionsDropdownProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUser(user.id);
      if (result.success) {
        onDeleted();
      }
      setOpen(false);
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded hover:bg-gray-100 text-gray-500"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-8 z-20 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={14} />
              {isPending ? "Deleting…" : "Delete User"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
