"use client";

import React, { useCallback, useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/shared/ui/table";
import { fetchFindings } from "@/modules/findings/actions";
import type { Finding } from "@/modules/findings/types";
import { FindingStatusDropdown } from "@/modules/findings/components";

// ---------------------------------------------------------------------------
// Severity badge helper
// ---------------------------------------------------------------------------
const SEVERITY_STYLES: Record<Finding["severity"], string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
};

// ---------------------------------------------------------------------------
// Column definitions – module-specific
// ---------------------------------------------------------------------------
const columns: ColumnDef<Finding>[] = [
  { key: "title", header: "Title" },
  {
    key: "severity",
    header: "Severity",
    render: (row) => (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full capitalize ${SEVERITY_STYLES[row.severity]}`}
      >
        {row.severity}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <span className="capitalize">{row.status.replace("_", " ")}</span>
    ),
  },
  { key: "assignee", header: "Assignee" },
  { key: "detectedAt", header: "Detected" },
];

// ---------------------------------------------------------------------------
// Page component – assembles the Compound Table with module-specific slots
// ---------------------------------------------------------------------------
export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const loadFindings = useCallback(() => {
    startTransition(async () => {
      const result = await fetchFindings();
      setFindings(result.findings);
      setError(result.error);
    });
  }, []);

  useEffect(() => {
    loadFindings();
  }, [loadFindings]);

  const filteredFindings = findings.filter(
    (f) =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.assignee.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Findings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and manage security findings across your organization.
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
            placeholder="Search findings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </DataTable.Toolbar>

      {/* Compound DataTable */}
      <DataTable
        columns={columns}
        data={filteredFindings}
        getRowKey={(row) => row.id}
      >
        <DataTable.Header />
        <DataTable.Body<Finding>
          renderActions={(row) => (
            <DataTable.ActionCell>
              <FindingStatusDropdown finding={row} onUpdated={loadFindings} />
            </DataTable.ActionCell>
          )}
        />
      </DataTable>

      {isPending && (
        <div className="mt-4 text-sm text-gray-400 text-center">Loading…</div>
      )}
    </div>
  );
}
