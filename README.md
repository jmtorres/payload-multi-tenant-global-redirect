# plugin-multi-tenant: `isGlobal` collections bounce tenant-scoped users to `/admin` (3.93.0)

Minimal reproduction on the `blank` template (SQLite), Payload `3.93.0`.

`GlobalViewRedirect` reads `tenantArrayFieldName` / `tenantArrayTenantFieldName`, but the
plugin registers it with `tenantsArrayFieldName` / `tenantsArrayTenantFieldName`. Both
arrive `undefined`, so since 3.93.0 (which always calls `getTenantOptions`) a user without
all-tenants access gets no tenant options and is redirected to `/admin`.

## Setup

- `tenants` collection, `settings` collection with `isGlobal: true`
- `users` with `roles` (`super-admin` | `user`); `userHasAccessToAllTenants` = has `super-admin`
- Seed: tenants A and B, `admin@example.com` (super-admin), `editor@example.com` (user, tenant A only),
  one `settings` doc for tenant A. All passwords: `test`.

## Steps

```sh
cp .env.example .env    # DATABASE_URL=file:./payload.db, set PAYLOAD_SECRET
pnpm install
pnpm payload run src/seed.ts
pnpm dev
```

1. Log in at http://localhost:3000/admin as `editor@example.com` / `test`.
2. Open **Settings** (http://localhost:3000/admin/collections/settings).

**Expected:** redirect to tenant A's settings doc (`/admin/collections/settings/1`).
**Actual:** after the page loads, the browser lands on `/admin` (dashboard).

Logging in as `admin@example.com` (all-tenants access) lands on `/admin/collections/settings/1` as expected.

## Workaround / confirmation of the cause

```sh
WORKAROUND=1 pnpm dev
```

`WORKAROUND=1` adds the misspelled prop names to the registered `GlobalViewRedirect`
`serverProps` (see `src/payload.config.ts`). The editor then lands on
`/admin/collections/settings/1`.

## Headless check

`node check-redirect.mjs <email> <password> [screenshot.png]` logs in, opens Settings and prints
the final path (`BASE_URL` defaults to `http://localhost:3000`; set `PW_CHANNEL=chrome` to use
the installed Chrome instead of Playwright's bundled browser).

Screenshots in `docs/`: `editor-bug.png`, `editor-workaround.png`, `super-admin.png`.
