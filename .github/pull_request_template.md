## Summary

<!-- What changed and why. One or two sentences. Link the issue if there is one. -->

Closes #

## Type of change

- [ ] Feature
- [ ] Bug fix
- [ ] Content / copy
- [ ] SEO / metadata
- [ ] Refactor or chore
- [ ] Dependency update

## Screenshots

<!-- Required for any UI change. Before / after if you changed something that already existed.
     Include mobile if the layout is responsive. Delete this section for non-UI changes. -->

## Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] New public routes were added to `src/lib/routes.ts` (drives sitemap, footer, `llms.txt`, `ai.txt`)
- [ ] New icons were added to the map in `src/components/Icon.tsx`
- [ ] Prisma schema changes ship with a migration in `prisma/migrations/`
- [ ] New env vars are documented in `README.md` **and** added to `.env.example` (placeholder only)
- [ ] New env vars are set in Coolify, with the build-time toggle on for anything `NEXT_PUBLIC_*`
- [ ] No secrets, real credentials, or lead PII in the diff

## Deploy notes

<!-- Anything that must happen around the deploy: migrations to run, env vars to set first,
     cache to purge, a route that needs re-verifying. "None" is a valid answer. -->

None
