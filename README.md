# SaaS Admin Dashboard

A Next.js 16 (App Router) SaaS admin project using a hybrid architectural pattern:

- **BFF (Backend-for-Frontend)** — All external API calls go through Next.js Server Actions. No tokens or secrets are exposed to the client.
- **Compound Component Pattern** — The `DataTable` is a reusable "skeleton" that accepts module-specific "slots" (toolbar, action dropdowns, buttons).
- **Adapter Pattern** — External API responses are mapped to strictly typed TypeScript interfaces before reaching the UI.

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **Lucide React** (icons)
- **Shadcn UI foundations** (class-variance-authority, clsx, tailwind-merge)

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to the login page.

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── login/page.tsx            # Login page (tenant ID + email + password)
│   ├── dashboard/
│   │   ├── layout.tsx            # Dashboard layout with sidebar navigation
│   │   ├── findings/page.tsx     # Findings module page
│   │   └── users/page.tsx        # Users module page
│   └── layout.tsx                # Root layout
├── components/shared/ui/
│   ├── table/                    # Compound DataTable component
│   │   └── data-table.tsx        # <DataTable>, <DataTable.Header>, <DataTable.Body>, etc.
│   └── modal/                    # Generic BaseModal shell
│       └── base-modal.tsx
├── lib/
│   ├── api.ts                    # Centralized fetch utility for external APIs
│   ├── session.ts                # Session management (cookie-based)
│   └── utils.ts                  # Utility functions (cn)
└── modules/
    ├── auth/
    │   └── actions.ts            # Login/Logout server actions
    ├── findings/
    │   ├── actions.ts            # Server Actions (BFF) for findings
    │   ├── types.ts              # TypeScript interfaces + Adapter
    │   └── components/           # Module-specific UI components
    └── users/
        ├── actions.ts            # Server Actions (BFF) for users
        ├── types.ts              # TypeScript interfaces + Adapter
        └── components/           # UserActionsDropdown, UserForm
```

## Architecture Patterns

### BFF (Backend-for-Frontend)

All `actions.ts` files are marked with `'use server'`. They:
1. Read the session (token + tenantID) from secure HTTP-only cookies
2. Call the external API via `src/lib/api.ts`
3. Transform responses through the Adapter layer
4. Return typed data to the client

### Compound Component Pattern

The `DataTable` component uses the compound pattern:

```tsx
<DataTable columns={columns} data={data} getRowKey={(row) => row.id}>
  <DataTable.Header />
  <DataTable.Body
    renderActions={(row) => (
      <DataTable.ActionCell>
        <MyModuleDropdown item={row} />
      </DataTable.ActionCell>
    )}
  />
</DataTable>
```

### Adding a New Module

1. Create `src/modules/[module-name]/`
2. Add `types.ts` with interfaces and an adapter function
3. Add `actions.ts` with `'use server'` directive
4. Add `components/` with module-specific UI
5. Create the page at `src/app/dashboard/[module-name]/page.tsx`

## Environment Variables

| Variable | Description |
|---|---|
| `EXTERNAL_API_BASE_URL` | Base URL for the external API (default: `https://api.example.com`) |
