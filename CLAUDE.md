# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## IMPORTANT: Docs-First Rule

**Before writing any code, always read the relevant documentation file(s) in the `/docs` directory first.** This is a hard requirement — do not rely on training data or assumptions. The `/docs` directory is the source of truth for how this project's patterns, APIs, and conventions work.

## Commands

```bash
npm run dev      # Start dev server (Turbopack, outputs to .next/dev)
npm run build    # Production build (Turbopack by default)
npm run start    # Start production server
npm run lint     # Run ESLint directly (not next lint — removed in v16)
```

## Stack

- **Next.js 16.2** with App Router (`src/app/`)
- **React 19.2**
- **Tailwind CSS 4** (configured via `@tailwindcss/postcss`)
- **TypeScript 5**

## Next.js 16 Breaking Changes to Know

**Async Request APIs** — `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are now fully async. Always `await` them:

```tsx
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
  const query = await props.searchParams
}
```

Run `npx next typegen` to generate `PageProps`, `LayoutProps`, and `RouteContext` helper types.

**`middleware` → `proxy`** — The `middleware.ts` file and `middleware` export are deprecated. Rename to `proxy.ts` and export a `proxy` function. The `edge` runtime is not supported in `proxy`; use Node.js only.

**`next/image` defaults changed**:
- `minimumCacheTTL`: 60s → 4 hours
- `imageSizes`: `16` removed from defaults
- `qualities`: now only `[75]` by default
- Local images with query strings require `images.localPatterns.search` config
- `images.domains` deprecated — use `images.remotePatterns`
- `next/legacy/image` deprecated — use `next/image`

**Caching APIs**:
- `cacheLife` and `cacheTag` are stable — drop the `unstable_` prefix
- `revalidateTag` now requires a second `cacheLife` profile argument: `revalidateTag('posts', 'max')`
- New: `updateTag` (Server Actions only) for immediate cache invalidation
- New: `refresh()` from `next/cache` to refresh the client router from a Server Action

**Partial Prerendering** — `experimental.ppr` removed; use `cacheComponents: true` in `next.config.ts`

**Parallel Routes** — All `@slot` directories now require an explicit `default.js` file or builds fail.

**`next build` no longer lints** — run `npm run lint` separately.

**Turbopack config** — `experimental.turbopack` moved to top-level `turbopack` in `next.config.ts`.

**Removed**: `serverRuntimeConfig`, `publicRuntimeConfig` (use env vars), AMP support, `next lint` command, `devIndicators.buildActivity` options.

## ESLint

Uses flat config format (`eslint.config.mjs`) compatible with ESLint v9+. Do not use `.eslintrc.*` format.
