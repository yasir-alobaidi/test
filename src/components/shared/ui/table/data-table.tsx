"use client";

import React, { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Context – passes column definitions down to all sub-components
// ---------------------------------------------------------------------------
export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface TableContextValue {
  columns: ColumnDef<any>[];
  data: any[];
  getRowKey: (row: any, index: number) => string;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const TableContext = createContext<TableContextValue | null>(null);

function useTableContext<T>() {
  const ctx = useContext(TableContext) as TableContextValue | null;
  if (!ctx) {
    throw new Error("Table compound components must be used within <DataTable>");
  }
  return ctx as unknown as {
    columns: ColumnDef<T>[];
    data: T[];
    getRowKey: (row: T, index: number) => string;
  };
}

// ---------------------------------------------------------------------------
// Root – the "skeleton" that accepts slots via children
// ---------------------------------------------------------------------------
interface DataTableRootProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  getRowKey?: (row: T, index: number) => string;
  children: React.ReactNode;
  className?: string;
}

function DataTableRoot<T>({
  columns,
  data,
  getRowKey = (_row, index) => String(index),
  children,
  className,
}: DataTableRootProps<T>) {
  return (
    <TableContext.Provider value={{ columns, data, getRowKey } as TableContextValue}>
      <div className={cn("w-full overflow-auto rounded-lg border border-gray-200", className)}>
        <table className="w-full text-sm text-left">{children}</table>
      </div>
    </TableContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Toolbar – a slot above the table for filters, search, buttons, etc.
// ---------------------------------------------------------------------------
function Toolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-2 p-4", className)}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header – renders <thead> from column definitions
// ---------------------------------------------------------------------------
function Header({ className }: { className?: string }) {
  const { columns } = useTableContext();
  return (
    <thead className={cn("bg-gray-50 border-b border-gray-200", className)}>
      <tr>
        {columns.map((col) => (
          <th
            key={col.key}
            className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider"
          >
            {col.header}
          </th>
        ))}
      </tr>
    </thead>
  );
}

// ---------------------------------------------------------------------------
// Body – renders <tbody> rows from data; delegates cell rendering to columns
// ---------------------------------------------------------------------------
function Body<T>({
  className,
  renderActions,
}: {
  className?: string;
  renderActions?: (row: T) => React.ReactNode;
}) {
  const { columns, data, getRowKey } = useTableContext<T>();
  return (
    <tbody className={className}>
      {data.length === 0 ? (
        <tr>
          <td
            colSpan={columns.length + (renderActions ? 1 : 0)}
            className="px-4 py-8 text-center text-gray-400"
          >
            No data available.
          </td>
        </tr>
      ) : (
        data.map((row, idx) => (
          <tr
            key={getRowKey(row, idx)}
            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            {columns.map((col) => (
              <td key={col.key} className="px-4 py-3 text-gray-700">
                {col.render
                  ? col.render(row)
                  : String(
                      (row as Record<string, unknown>)[col.key] ?? ""
                    )}
              </td>
            ))}
            {renderActions && (
              <td className="px-4 py-3 text-right">
                {renderActions(row)}
              </td>
            )}
          </tr>
        ))
      )}
    </tbody>
  );
}

// ---------------------------------------------------------------------------
// ActionCell – a convenience wrapper for the "actions" column cell
// ---------------------------------------------------------------------------
function ActionCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagination – a simple prev/next pagination bar
// ---------------------------------------------------------------------------
interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm text-gray-600",
        className
      )}
    >
      <span>
        Page {page} of {totalPages} ({total} items)
      </span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------
export const DataTable = Object.assign(DataTableRoot, {
  Toolbar,
  Header,
  Body,
  ActionCell,
  Pagination,
});
