# GATEVIA Initial Content Seed — Integration

## Files

Copy:

```text
prisma/seed/content.ts
```

into the current GATEVIA repository.

Add this script to the root `package.json` under `scripts`:

```json
"seed:content": "tsx prisma/seed/content.ts"
```

Do not replace the entire current `package.json`; add only the script above.

## Behavior

The seed is additive and idempotent. Stable deterministic UUIDs are used for seeded entities and reruns do not overwrite Admin edits.

Default mode creates initial business content as `draft`:

```bash
pnpm seed:content
```

For the current staging environment only, if you intentionally want the non-legal seeded content immediately published on the *first* run:

```bash
GATEVIA_CONTENT_SEED_STATUS=published pnpm seed:content
```

Legal pages always remain `draft` and require review.

## Seeded

- 21 CMS/navigation target pages in English + Arabic.
- Home structured sections.
- Saudi Market Entry structured sections.
- How We Work structured sections.
- About GATEVIA structured sections.
- Ecosystem structural page.
- Draft legal-page shells.
- 3 service categories.
- 24 proposed services from the repo-local GATEVIA requirements.
- 8 initial FAQs.
- Main navigation structure.
- Footer Services / Company / Resources / Legal structures.
- Initial company name and default SEO settings only when those settings are still empty.

## Intentionally not seeded

No invented or unapproved data is created for:

- Industries (the repo-local docs do not define an approved industry list).
- Clients.
- Partners.
- Case studies.
- Testimonials.
- Certifications.
- Trust metrics.
- Brands.
- Products / ventures.
- Team members.

This follows `gatevia-docs/3-technical/20_SEED_INITIAL_DATA_CONTRACT.md`, which forbids fake production trust/business data.

## Recommended staging run

After integrating and redeploying the API image:

```bash
pnpm seed:content
pnpm seed:content
```

The second run should complete without duplicates. Review/edit content in Admin, then publish approved records from Admin.
