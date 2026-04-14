"use client";

import React, { useTransition } from "react";
import { updateFindingStatus } from "@/modules/findings/actions";
import type { Finding } from "@/modules/findings/types";

interface FindingStatusDropdownProps {
  finding: Finding;
  onUpdated: () => void;
}

const STATUS_OPTIONS: { value: Finding["status"]; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export function FindingStatusDropdown({
  finding,
  onUpdated,
}: FindingStatusDropdownProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    startTransition(async () => {
      const result = await updateFindingStatus(finding.id, e.target.value);
      if (result.success) {
        onUpdated();
      }
    });
  }

  return (
    <select
      value={finding.status}
      onChange={handleChange}
      disabled={isPending}
      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
