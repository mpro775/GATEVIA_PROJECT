# GATEVIA Admin Arabic / RTL — Final Micro Closure Pass

**Status:** FINAL MICRO PASS  
**Scope:** Close only the remaining localization defects listed in this file.  
**Do not redesign, refactor broadly, or rebuild existing Admin i18n/media/filter architecture.**  
**Do not deploy / push / merge / tag unless explicitly instructed.**

---

## Objective

The Admin Arabic/RTL implementation is already substantially complete.

This pass exists only to close the remaining confirmed defects before production deployment.

The implementation agent must fix exactly these areas:

1. Pagination wiring
2. Sales titles
3. Remaining hard-coded English
4. ContentEditor messages
5. Settings / Navigation messages
6. Lead Detail leftovers
7. Reset / Invitation loading states
8. Media errors
9. Media dialog `aria-labelledby`
10. DataTable aria labels / domain labels
11. Real i18n parity / fallback tests

Do not reopen completed architecture work.

---

# 1. Pagination wiring

The shared Pagination primitive has already been extended to support localized labels.

Do NOT rebuild the component.

Audit the Admin Pagination usage, especially:

```text
apps/admin/components/data-table.tsx
```

Current incorrect pattern is equivalent to:

```tsx
<Pagination
  page={page}
  pageCount={state.pageCount || 1}
  onPage={setPage}
/>
```

Pass localized labels from Admin i18n.

Expected equivalent:

```tsx
<Pagination
  page={page}
  pageCount={state.pageCount || 1}
  onPage={setPage}
  previousLabel={t('action.previous')}
  nextLabel={t('action.next')}
  ariaLabel={t('pagination.label')}
/>
```

Use the actual component API that exists in the repository.

Audit every Admin Pagination caller.

### Acceptance

Arabic UI must never display:

```text
Previous
Next
Pagination
```

from shared English defaults.

English mode must remain correct.

---

# 2. Fix Sales route titles

There is a confirmed title-resolution bug because multiple Sales pages share:

```text
resource="leads"
```

Do not derive all page titles only from `resource`.

These routes must display distinct titles:

```text
/sales/leads
/sales/consultation
/sales/assessments
```

Required titles:

| Route | English | Arabic |
|---|---|---|
| `/sales/leads` | Leads | العملاء المحتملون |
| `/sales/consultation` | Consultation Requests | طلبات الاستشارة |
| `/sales/assessments` | Assessments | التقييمات |

Use an explicit page/source/title translation key or another clean context-aware solution.

Do not alter the backend resource semantics.

### Acceptance

The three pages above show three distinct correct titles in both languages.

---

# 3. Remove remaining Admin-visible hard-coded English

Perform a focused repository audit of:

```text
apps/admin/**/*.ts
apps/admin/**/*.tsx
```

Every remaining **administrator-visible** English string must use the existing Admin i18n layer.

Do not blindly translate:

- internal enum/API values;
- imports;
- type names;
- developer logs;
- comments;
- IDs;
- URLs;
- user/business content.

Classify each finding.

Required final result:

```text
0 unresolved Admin-visible hard-coded English findings
```

Useful audit examples:

```bash
rg -n \
  --glob 'apps/admin/**/*.{ts,tsx}' \
  '(aria-label|placeholder|title)=["'\''][A-Za-z]' \
  apps/admin
```

```bash
rg -n \
  --glob 'apps/admin/**/*.{ts,tsx}' \
  '>[[:space:]]*[A-Z][^<{]*<' \
  apps/admin
```

```bash
rg -n \
  'Loading|Save failed|Upload failed|Archive failed|Lead unavailable|No changes to save|Navigation saved|Untitled|Translation locale|Translation completeness|Featured filter' \
  apps/admin
```

Review results manually.

---

# 4. ContentEditor messages

Close all remaining user-visible English messages in:

```text
apps/admin/components/content-editor.tsx
```

Confirmed examples include:

```text
Value must be a JSON array.
Value must be valid structured JSON.
Invalid JSON.
Cannot save content.
Archived successfully.
Moved to draft.
Preview could not be opened.
```

Also audit the component for any remaining:

- validation messages;
- save errors;
- publish errors;
- archive messages;
- preview messages;
- success notifications;
- empty states;
- placeholders;
- helper text;
- aria labels.

Move them to:

```text
apps/admin/lib/i18n/en.ts
apps/admin/lib/i18n/ar.ts
```

or the existing dictionary structure.

Do not translate actual JSON/data values.

---

# 5. Settings / Navigation messages

## Navigation

Audit:

```text
apps/admin/components/navigation-editor.tsx
```

Confirmed remaining examples:

```text
Edit menus and their items. Changes take effect after saving and publishing.
Failed to load menu details.
Navigation saved.
Save failed.
```

Also inspect all navigation-specific messages.

## Settings

Audit:

```text
apps/admin/components/settings-editor.tsx
```

Confirmed examples:

```text
No changes to save.
Settings saved.
Save failed.
```

All visible messages must use `t(...)`.

Do not translate stored setting keys or stored navigation content.

---

# 6. Lead Detail leftovers

Audit:

```text
apps/admin/components/lead-detail.tsx
```

Confirmed remaining visible strings include:

```text
Lead unavailable
The record does not exist or you cannot access it.
Loading…
Note (visible only to your team)
Add context, next steps or outcome…
```

Translate all remaining:

- headings;
- errors;
- loading states;
- note labels;
- placeholders;
- action feedback;
- aria labels.

Do not translate lead-entered content.

---

# 7. Reset Password / Accept Invitation loading states

Audit the Reset Password and Accept Invitation routes/components.

Remove hard-coded fallback content equivalent to:

```tsx
<Suspense fallback={<p>Loading…</p>}>
```

Use the existing Admin i18n system.

The fallback must follow the selected Admin interface language.

Also audit those flows for:

- invalid token;
- expired token;
- password validation;
- success state;
- submit state;
- invitation accepted;
- authentication messages.

Only fix visible localization gaps; do not redesign authentication.

---

# 8. Media errors

Audit:

```text
apps/admin/components/media-library.tsx
apps/admin/components/media-browser.tsx
apps/admin/components/media-picker.tsx
```

Confirmed English errors include examples equivalent to:

```text
Upload failed
Object upload failed
Request failed
Archive failed
Failed to create folder
```

Do not display raw English client messages in Arabic mode.

Translate known user-facing error states.

Where dynamic context is useful, preserve it safely.

Example:

```ts
t('media.uploadFailedFor', { fileName: file.name })
```

If the existing translation helper does not support interpolation, use the existing project convention rather than introducing a second localization system.

### Raw API errors

If raw `error.message` is currently shown directly:

- map known UI cases to translated copy;
- preserve technical detail only where appropriate for debugging/logging;
- do not expose unnecessary raw English errors to Arabic UI.

Do not hide genuinely actionable information.

---

# 9. Media Picker dialog `aria-labelledby`

Fix accessibility in:

```text
apps/admin/components/media-picker.tsx
```

Current dialog must be linked to a localized title.

Use equivalent structure:

```tsx
<dialog
  ref={dialog}
  className="media-picker-dialog"
  aria-labelledby="media-picker-title"
>
  <h2 id="media-picker-title">
    {t('media.chooseMedia')}
  </h2>
</dialog>
```

The exact ID may differ.

Requirements:

- ID exists.
- ID is unique.
- `aria-labelledby` matches it.
- title is localized.
- Close / Cancel / Select accessible names are localized.

Do not rebuild the dialog.

---

# 10. DataTable aria labels / domain labels

Audit:

```text
apps/admin/components/data-table.tsx
```

Confirmed hard-coded accessibility strings include:

```text
Featured filter
Translation locale
Translation completeness
```

Also audit domain filter labels such as:

```text
Category
Industry
Service
```

Do not use raw English filter metadata to build accessible labels.

Replace with translation keys.

Bad:

```ts
['categoryId', 'Category']
```

when the display/accessibility label is consumed directly.

Preferred patterns include semantically keyed definitions such as:

```ts
{
  key: 'categoryId',
  labelKey: 'filter.category'
}
```

or equivalent.

Also remove locale-unsafe generated English sentences such as:

```text
All {label.toLowerCase()} records
```

Use explicit translation keys instead:

```text
filter.allCategories
filter.allIndustries
filter.allServices
```

or another locale-safe implementation.

### Untitled

Audit any Admin-visible fallback:

```text
Untitled
```

If displayed to the administrator, localize it through a translation key.

Do not mutate actual record names.

---

# 11. Real i18n parity and fallback tests

Strengthen:

```text
apps/admin/lib/i18n/i18n.test.ts
```

The current test named similarly to:

```text
falls back to English
```

must actually test fallback behavior.

Do not use keys that already exist in both Arabic and English.

## Required test coverage

### Dictionary parity

Assert:

```text
English keys missing in Arabic = 0
Arabic keys missing in English = 0
```

### Locale direction

Verify:

```text
ar -> rtl
en -> ltr
```

### Locale normalization

Verify expected aliases/normalization used by the current implementation.

### Real fallback

If the translation architecture supports fallback for missing locale entries, construct a valid isolated test case that genuinely exercises fallback.

If compile-time dictionary parity intentionally makes missing production keys impossible, test the translation fallback helper directly with a controlled test dictionary / test fixture, rather than pretending a normal translated key is missing.

### Unknown keys

Verify the project's intended unknown-key behavior.

Do not weaken type safety just to make fallback testable.

---

# 12. Translation keys to add

Add only the keys required by the remaining UI.

Suggested semantic groups:

```text
pagination.*
sales.*
contentEditor.messages.*
navigation.messages.*
settings.messages.*
lead.*
auth.*
media.errors.*
filter.*
common.loading
common.untitled
```

Reuse existing keys when the semantics match.

Do not add duplicate keys for identical concepts unnecessarily.

Keep Arabic and English key sets aligned.

---

# 13. Do not regress existing completed work

This micro pass must preserve:

## Admin i18n architecture

```text
AdminLocaleProvider
AdminLanguageToggle
useAdminI18n()
gatevia_admin_locale
dynamic html lang/dir
```

## Media Browser

Preserve:

```text
folders
server-side search
pagination
Grid/List
MIME filtering
selected asset loading by ID
```

## Admin Filter Bar

Preserve:

```text
compact desktop layout
responsive mobile layout
advanced filters
reset filters
```

Do not replace or rewrite those systems.

---

# 14. Static audit required before PASS

After implementation, run a final source audit.

At minimum search for the confirmed strings:

```bash
rg -n \
  'Previous|Next|Pagination|Featured filter|Translation locale|Translation completeness|Lead unavailable|Loading…|Loading\.\.\.|Upload failed|Object upload failed|Request failed|Archive failed|Failed to create folder|No changes to save|Settings saved|Navigation saved|Save failed|Invalid JSON|Cannot save content|Untitled' \
  apps/admin packages/ui/src
```

For every match classify it:

```text
A. Admin-visible => MUST use i18n
B. internal/API/developer-only => allowed
C. test fixture intentionally asserting English => allowed
D. translation dictionary source => expected
```

Required final result:

```text
Category A unresolved findings: 0
```

---

# 15. Required quality gates

Run the repository's canonical equivalents of:

```bash
pnpm --filter @gatevia/admin typecheck
pnpm --filter @gatevia/admin lint
pnpm --filter @gatevia/admin test
pnpm --filter @gatevia/admin build
```

Because shared Pagination may be touched:

```bash
pnpm --filter @gatevia/ui typecheck
pnpm --filter @gatevia/ui lint
pnpm --filter @gatevia/ui build
```

Then, if supported:

```bash
pnpm turbo build
```

Also run:

```bash
git diff --check
```

Do not report PASS if build/typecheck fails.

If a command does not exist, use the repository's actual canonical command and document it in the report.

---

# 16. Focused manual QA

Test both:

```text
English / LTR
Arabic / RTL
```

## Pagination

Open a paginated Admin table.

Arabic must show:

```text
السابق
التالي
```

No English pagination accessibility label.

## Sales

Verify:

```text
/sales/leads
/sales/consultation
/sales/assessments
```

have correct distinct titles.

## Content editor

Trigger representative validation/save/preview/archive states.

No English messages in Arabic mode.

## Navigation / Settings

Save successfully and inspect failure/empty paths if possible.

No English messages in Arabic mode.

## Lead

Open lead detail, loading state, unavailable state, note field.

No English remainder.

## Authentication

Inspect:

```text
Reset Password
Accept Invitation
```

including Suspense/loading state.

No hard-coded `Loading…`.

## Media

Open Media Picker.

Verify:

- localized dialog title;
- valid `aria-labelledby`;
- localized buttons;
- localized errors/statuses;
- no raw English known errors.

## Filters

Inspect Category/Industry/Service/Featured/translation filters with a screen-reader-oriented DOM check if possible.

No English-only `aria-label`.

---

# 17. Definition of Done

This micro pass is PASS only if every item below is true.

- [ ] Admin Pagination receives localized labels.
- [ ] `/sales/leads` title is correct.
- [ ] `/sales/consultation` title is correct.
- [ ] `/sales/assessments` title is correct.
- [ ] ContentEditor remaining messages are localized.
- [ ] Navigation remaining messages are localized.
- [ ] Settings remaining messages are localized.
- [ ] Lead Detail remaining strings are localized.
- [ ] Reset Password loading state is localized.
- [ ] Accept Invitation loading state is localized.
- [ ] Known Media errors are localized.
- [ ] Raw known English Media UI errors are not exposed in Arabic mode.
- [ ] Media dialog has valid localized `aria-labelledby`.
- [ ] DataTable filter `aria-label`s are localized.
- [ ] Category / Industry / Service display labels are localized.
- [ ] Locale-unsafe “All X records” generation is removed.
- [ ] Admin-visible `Untitled` fallback is localized.
- [ ] English/Arabic dictionary key parity = 100%.
- [ ] A genuine fallback test exists.
- [ ] Unknown-key behavior is tested.
- [ ] Admin typecheck passes.
- [ ] Admin lint passes.
- [ ] Admin tests pass.
- [ ] Admin build passes.
- [ ] Shared UI checks pass.
- [ ] `git diff --check` passes.
- [ ] Final static audit has 0 unresolved Admin-visible English findings in this scope.

---

# 18. Required final agent report

Return exactly this structure:

```md
# GATEVIA ADMIN ARABIC / RTL — FINAL MICRO CLOSURE REPORT

## Status
PASS / FAIL

## Baseline
- Branch:
- Baseline SHA:
- Final SHA:

## Fixed items
- Pagination wiring:
- Sales titles:
- Hard-coded English cleanup:
- ContentEditor messages:
- Settings / Navigation messages:
- Lead Detail:
- Reset / Invitation loading:
- Media errors:
- Media aria-labelledby:
- DataTable accessibility/domain labels:
- i18n tests:

## Translation parity
- English key count:
- Arabic key count:
- Missing in Arabic:
- Missing in English:

## Static audit
- Admin-visible unresolved hard-coded English findings:
- Allowed internal/test/dictionary exceptions:

## Tests
- Admin typecheck:
- Admin lint:
- Admin tests:
- Admin build:
- UI typecheck:
- UI lint:
- UI build:
- turbo build:
- git diff --check:

## Manual QA
- Pagination AR/EN:
- Sales titles:
- Content Editor:
- Navigation:
- Settings:
- Lead Detail:
- Reset Password:
- Accept Invitation:
- Media Picker:
- Filters/accessibility:
- RTL smoke test:

## Regression statement
Confirm that the following were not regressed:
- Admin i18n architecture
- content locale behavior
- Media Browser
- Media pagination/folders/search/MIME filtering
- Admin Filter Bar
- permissions/authorization
- public website behavior

## Final conclusion
Explicitly state whether this exact source is ready to deploy.
```

---

# Final instruction

This is a **micro closure**, not a new implementation phase.

Do not perform unrelated refactors.

Do not rewrite completed components.

Do not report PASS while any confirmed item in this file remains unresolved.

The required final state is:

```text
GATEVIA ADMIN ARABIC / RTL
FINAL MICRO CLOSURE: PASS

Admin-visible hard-coded English findings in audited scope: 0
Build / tests: PASS
Ready to deploy: YES
```
