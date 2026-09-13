# GATEVIA Admin — Final Arabic / RTL Closure

**Status:** FINAL CLOSURE TASK  
**Scope:** Admin UI localization only  
**Target:** `apps/admin` + the minimum shared UI changes required for Admin localization  
**Do not deploy until all acceptance gates in this document pass.**

---

## 1. Objective

Complete the Arabic localization of the GATEVIA Admin Panel so that switching the Admin UI language to Arabic produces a **fully Arabic, RTL-consistent, production-ready administration experience**, without mixed English/Arabic UI.

This is a **closure task**, not a redesign.

The previous implementation already introduced the localization foundation, locale provider, language switcher, RTL support, Media Browser improvements, and Admin Filter Bar. Do **not** rebuild those systems. Extend and harden the existing implementation.

The final result must satisfy all of the following:

- Admin UI supports `ar` and `en`.
- Arabic mode is fully RTL.
- English mode remains fully LTR.
- No user-facing Admin control, heading, label, help text, error, empty state, filter, pagination control, dialog, editor, or status remains hard-coded in English.
- Content language remains separate from Admin interface language.
- Existing forms, APIs, permissions, workflows, media handling, and business behavior must not regress.
- No Arabic strings may be scattered directly across components as a shortcut. All UI copy must use the Admin i18n layer.

---

# 2. Existing architecture that MUST be preserved

The repository already contains the Admin localization foundation:

```text
apps/admin/lib/i18n/ar.ts
apps/admin/lib/i18n/en.ts
apps/admin/lib/i18n/config.ts
apps/admin/lib/i18n/index.ts
apps/admin/lib/i18n/i18n.test.ts

apps/admin/components/admin-locale-provider.tsx
apps/admin/components/admin-language-toggle.tsx
```

The document/root layout already supports dynamic language/direction behavior.

The Admin UI locale cookie is:

```text
gatevia_admin_locale
```

Do not replace this architecture with another localization library unless there is a proven blocker.

Use the existing:

```ts
useAdminI18n()
```

and existing translation conventions.

---

# 3. Non-negotiable separation: Admin UI language vs content language

These are two independent concepts and MUST remain independent.

## Admin UI language

Controls the interface itself:

```text
Dashboard
Save
Publish
Search
Previous
Next
Navigation Builder
Account details
...
```

Arabic examples:

```text
لوحة التحكم
حفظ
نشر
بحث
السابق
التالي
منشئ التنقل
تفاصيل الحساب
...
```

This is controlled by the Admin language switcher / `gatevia_admin_locale`.

## Content language

Controls which localized website content an administrator is editing, such as:

```text
ar-SA
en
```

Changing the Admin UI to Arabic MUST NOT silently change the content locale being edited.

Changing a content locale MUST NOT change the Admin UI language.

---

# 4. Primary closure requirement

Perform a repository-wide audit of **all Admin-visible strings**.

Do not only modify the files listed below.

The files listed here are confirmed hotspots from the current source and MUST be fixed, but the agent must scan the entire `apps/admin` tree for additional untranslated UI strings.

Confirmed remaining hotspots include:

```text
apps/admin/components/content-editor.tsx
apps/admin/components/navigation-editor.tsx
apps/admin/components/settings-editor.tsx
apps/admin/components/redirect-editor.tsx
apps/admin/components/language-editor.tsx
apps/admin/components/role-editor.tsx
apps/admin/components/user-editor.tsx
apps/admin/components/lead-detail.tsx
apps/admin/components/auth-gate.tsx
apps/admin/components/data-table.tsx
apps/admin/components/media-library.tsx
apps/admin/components/media-picker.tsx
apps/admin/components/media-browser.tsx
apps/admin/components/shell.tsx
packages/ui/src/primitives.tsx
```

Also inspect:

```text
apps/admin/app/**
apps/admin/components/**
apps/admin/lib/**
```

for Admin-visible copy.

---

# 5. Content Editor — highest priority

`apps/admin/components/content-editor.tsx` is a critical closure blocker.

It currently contains multiple user-facing strings directly in English.

All visible labels, headings, helper texts, button texts, status texts, placeholders, option labels, empty states, validation messages, and editor metadata must use the Admin i18n layer.

Confirmed examples include, but are not limited to:

```text
Edit / Create
Relations
Content settings
Publishing
Workflow status
Draft
Review
Published
Page sections
Section type
Theme
Default
Inverse
Authored
Missing
No sections yet
No options available
Select
None
```

Also localize all section/editor field labels such as:

```text
Eyebrow
Heading
Body
Primary CTA
Secondary CTA
Hero media
Services
Industries
Process steps
Service categories
Timeline steps
Testimonials
Case studies
Clients
Partners
FAQs
Insights
Brands
Products
Form type
```

And any similar field labels not listed above.

## Important

Do not translate:

- user-authored content values;
- stored slugs;
- internal IDs;
- raw API values where they are not shown to the user;
- enum values sent to the API.

Translate only their UI representation.

Example:

```ts
value="published"
```

may remain the API value, while its visible label becomes:

```tsx
<option value="published">{t('status.published')}</option>
```

---

# 6. Navigation Editor

Fully localize:

```text
apps/admin/components/navigation-editor.tsx
```

Confirmed remaining UI strings include:

```text
Navigation Builder
Menus
No navigation menus found
No items yet
Internal Content
External URL
Pages
Services
Industries
Case Studies
Insights
Select Item
Top level
```

Also audit:

- add/remove item actions;
- move/reorder controls;
- link type labels;
- target labels;
- parent selectors;
- empty states;
- errors;
- confirmation prompts;
- save states.

The navigation data itself must not be translated automatically.

---

# 7. Settings Editor

Fully localize:

```text
apps/admin/components/settings-editor.tsx
```

Confirmed examples include:

```text
Global Settings
No settings in this group
Status
```

Also localize:

- group names shown to the administrator;
- setting labels/descriptions when they are Admin UI metadata;
- save/error/success messages;
- empty states;
- boolean option labels.

Do not modify stored setting keys.

---

# 8. Redirect Editor

Fully localize:

```text
apps/admin/components/redirect-editor.tsx
```

Audit all visible copy including:

- create/edit headings;
- source path;
- destination path;
- status code;
- active/inactive;
- save/delete actions;
- validation;
- empty states;
- destructive confirmation copy.

Do not translate actual URL/path values.

---

# 9. Language Editor

Fully localize:

```text
apps/admin/components/language-editor.tsx
```

This page manages **website/content languages**.

Its Admin interface must follow the selected Admin UI locale.

Do not confuse:

```text
Admin UI Arabic
```

with:

```text
Website locale ar-SA
```

Localize:

- headings;
- field labels;
- status labels;
- default language indicators;
- create/edit/delete actions;
- validation/error states.

Do not translate language codes.

---

# 10. Roles and Users

Fully localize:

```text
apps/admin/components/role-editor.tsx
apps/admin/components/user-editor.tsx
```

Confirmed User Editor examples include:

```text
Account details
Roles
Status
Active
Invited
Suspended
No roles found
```

Also localize:

- role descriptions;
- permission group UI labels;
- permission selector headings;
- save/cancel;
- invitation state labels;
- empty states;
- errors;
- delete/suspend/reactivate confirmations if present.

Do not change permission keys or role identifiers sent to the backend.

---

# 11. Lead Detail / Sales UI

Fully localize:

```text
apps/admin/components/lead-detail.tsx
```

Confirmed remaining examples include:

```text
Contact & attribution
Add internal note
Add note
Activity timeline
Lead status
Assigned to
Quick info
Created
Possible duplicate
Unassigned
```

Also localize:

- timeline event labels;
- attribution labels;
- assignment states;
- duplicate warnings;
- notes UI;
- contact metadata labels;
- status controls;
- empty states and errors.

User-entered lead data must remain unchanged.

---

# 12. Auth Gate and authentication surfaces

Audit:

```text
apps/admin/components/auth-gate.tsx
apps/admin/app/**/login*
apps/admin/app/**/auth*
```

Localize every visible state:

- checking session;
- unauthorized;
- session expired;
- retry;
- sign in;
- sign out;
- authentication errors.

No English-only fallback should appear after selecting Arabic.

---

# 13. Data Table final localization

Audit:

```text
apps/admin/components/data-table.tsx
```

The structural Admin Filter Bar work already exists. Do not rebuild it.

Close remaining untranslated UI/accessibility strings.

Confirmed examples include:

```tsx
aria-label="Featured filter"
aria-label="Translation locale"
aria-label="Translation completeness"
```

These must use translations.

Also fix generated strings such as:

```text
All {filter.label.toLowerCase()} records
```

Do not build English sentences dynamically from English labels.

Use explicit translation keys.

For example:

```ts
filter.allCategories
filter.allIndustries
filter.allServices
```

or another locale-safe approach.

Localize filter definition labels such as:

```text
Category
Industry
Service
```

and all similar filter labels.

---

# 14. Sales page title correctness

Fix the confirmed title-resolution issue where multiple Sales routes may use:

```text
resource="leads"
```

and therefore incorrectly show the generic Leads title.

The following pages must display distinct translated titles:

```text
/sales/leads
/sales/consultation
/sales/assessments
```

Expected semantic titles:

English:

```text
Leads
Consultation Requests
Assessments
```

Arabic:

```text
العملاء المحتملون
طلبات الاستشارة
التقييمات
```

Do not infer the page title solely from `resource` when different route contexts share the same underlying resource.

Use an explicit page/source/title key or equivalent clean solution.

---

# 15. Pagination localization

The shared pagination component currently contains visible hard-coded English such as:

```text
Previous
Next
```

in:

```text
packages/ui/src/primitives.tsx
```

Do NOT make the generic shared UI package depend directly on Admin i18n.

Preferred solution:

Extend Pagination to accept optional localized labels, for example:

```ts
type PaginationProps = {
  // existing props...
  previousLabel?: string;
  nextLabel?: string;
  ariaLabel?: string;
};
```

Keep safe English defaults inside the generic primitive if necessary.

Admin callers must pass:

```ts
t('action.previous')
t('action.next')
t('pagination.label')
```

This keeps `packages/ui` reusable.

Audit all Admin Pagination usages and ensure Arabic mode never shows:

```text
Previous
Next
Pagination
```

in English.

---

# 16. Media UI final localization

The Media Browser / Picker architecture is already substantially complete.

Do NOT rebuild the browser.

Only close remaining localization/accessibility gaps.

Audit:

```text
apps/admin/components/media-library.tsx
apps/admin/components/media-picker.tsx
apps/admin/components/media-browser.tsx
```

Confirmed raw error messages include examples such as:

```text
Upload failed
Archive failed
Failed to create folder
Upload failed for {file.name}
```

Move all administrator-visible errors to translation keys.

When dynamic data exists, support interpolation safely.

Example:

```ts
t('media.uploadFailedFor', { fileName: file.name })
```

or use the existing project interpolation convention.

Also localize:

- status display labels;
- upload states;
- archive states;
- folder actions;
- view toggle labels;
- pagination;
- search placeholders;
- empty states;
- file metadata labels;
- selection actions.

Raw backend status/API values may remain English internally but must display translated labels.

Example:

```text
ready -> جاهز
processing -> قيد المعالجة
failed -> فشل
archived -> مؤرشف
```

where applicable.

---

# 17. Media dialog accessibility closure

The Media Picker dialog must expose an accessible localized title.

Use a pattern equivalent to:

```tsx
<dialog aria-labelledby="media-picker-title">
  <h2 id="media-picker-title">
    {t('media.chooseMedia')}
  </h2>
</dialog>
```

The actual ID may differ, but:

- it must exist;
- it must be unique;
- it must match `aria-labelledby`;
- the title must localize.

Also audit dialog Close/Cancel/Select controls for localized accessible names.

---

# 18. Mobile sidebar accessibility closure

If the mobile menu trigger contains:

```tsx
aria-controls="mobile-sidebar"
```

the controlled sidebar must actually expose:

```tsx
id="mobile-sidebar"
```

or an equivalent matching ID.

Audit:

```text
apps/admin/components/shell.tsx
```

The accessible labels for:

- open menu;
- close menu;
- account menu;
- language toggle;

must localize as well.

---

# 19. Status / enum presentation layer

Do not display raw backend enum values directly when Arabic mode is enabled.

Create/reuse translation mappings for user-visible statuses.

Examples may include:

```text
draft
review
published
archived
active
inactive
invited
suspended
ready
processing
failed
featured
not featured
assigned
unassigned
```

Do not mutate API payload values.

Only translate presentation.

Avoid ad-hoc code such as:

```ts
status === 'draft' ? 'مسودة' : ...
```

spread across components.

Use centralized translation keys.

---

# 20. Dates, times, numbers and locale formatting

Audit all Admin-visible formatting.

Do not leave hard-coded:

```ts
new Intl.DateTimeFormat('en')
```

for UI that supports Arabic.

Formatting should follow the active **Admin UI locale**, unless the field has a domain-specific reason not to.

Expected:

```text
English UI -> English locale formatting
Arabic UI  -> Arabic-compatible locale formatting
```

Use the project's selected Admin locale mapping consistently, e.g.:

```text
en -> en
ar -> ar-SA
```

Do not alter stored timestamps.

Do not alter business timezone semantics.

This task concerns presentation only.

---

# 21. RTL hardening

The root direction handling already exists.

Do not add manual:

```css
direction: rtl;
```

randomly inside every component.

Prefer logical CSS properties:

```text
margin-inline-start
margin-inline-end
padding-inline-start
padding-inline-end
inset-inline-start
inset-inline-end
border-inline-start
border-inline-end
text-align: start
```

Audit Arabic mode for:

- sidebars;
- drawers;
- dialogs;
- tables;
- filters;
- dropdowns;
- breadcrumbs;
- forms;
- tabs;
- badges;
- pagination;
- action groups;
- icon/text spacing;
- chevrons/arrows;
- drag/reorder controls.

Directional icons must be mirrored only when their semantics are directional.

Do not mirror neutral icons such as:

- search;
- settings;
- plus;
- trash;
- image;
- folder.

---

# 22. Translation dictionary rules

All Admin strings must live in:

```text
apps/admin/lib/i18n/en.ts
apps/admin/lib/i18n/ar.ts
```

or the existing modular structure if those dictionaries are split during implementation.

Both dictionaries must remain type-safe and aligned.

Avoid vague keys such as:

```text
text1
label2
messageA
```

Use semantic keys, for example:

```text
contentEditor.publishing
contentEditor.workflowStatus
navigation.builder
settings.globalSettings
users.accountDetails
leads.activityTimeline
media.uploadFailed
filter.featured
status.suspended
pagination.label
```

Reuse shared keys when semantics are truly shared:

```text
action.save
action.cancel
action.delete
action.previous
action.next
common.none
common.status
```

Do not over-reuse a translation merely because the English wording happens to match.

---

# 23. Arabic terminology consistency

Use consistent Arabic terminology across the Admin panel.

Recommended terms:

| English | Arabic |
|---|---|
| Dashboard | لوحة التحكم |
| Save | حفظ |
| Cancel | إلغاء |
| Delete | حذف |
| Edit | تعديل |
| Create | إنشاء |
| Search | بحث |
| Filters | الفلاتر |
| More filters | المزيد من الفلاتر |
| Reset filters | إعادة تعيين الفلاتر |
| Previous | السابق |
| Next | التالي |
| Status | الحالة |
| Draft | مسودة |
| Review | قيد المراجعة |
| Published | منشور |
| Archived | مؤرشف |
| Active | نشط |
| Inactive | غير نشط |
| Suspended | موقوف |
| Media | الوسائط |
| Folder | مجلد |
| Upload | رفع |
| Navigation | التنقل |
| Settings | الإعدادات |
| Users | المستخدمون |
| Roles | الأدوار |
| Leads | العملاء المحتملون |
| Consultation Requests | طلبات الاستشارة |
| Assessments | التقييمات |
| Assigned to | مسند إلى |
| Unassigned | غير مسند |
| Activity timeline | سجل النشاط |

If the existing Arabic dictionary already adopted a different consistent term, preserve the established project terminology unless it is clearly incorrect.

---

# 24. Error messages

Every administrator-visible client-side error must localize.

Do not expose raw English messages generated inside the Admin frontend.

If the API provides an end-user-safe localized message architecture, use it appropriately.

If the API only returns technical English messages, map known UI cases to localized Admin copy while preserving technical details for logs/dev diagnostics where useful.

Do not hide actionable error information.

---

# 25. Empty, loading and success states

Audit every screen for:

```text
Loading...
No records found
No results
No options available
Saving...
Saved
Publishing...
Upload complete
No folders
No media
No roles
No navigation menus
No sections
```

All must follow the active Admin UI locale.

Avoid a polished translated normal state with English loading/error states.

---

# 26. Placeholders and accessible names

The following are part of localization and MUST be audited:

```text
placeholder
title
aria-label
aria-labelledby
aria-description
alt
button accessible name
dialog accessible name
input accessible label
```

Do not leave accessibility-only English strings because they are "not visible".

Screen-reader copy is part of the UI.

---

# 27. What must NOT be translated

Do not translate or mutate:

- IDs;
- UUIDs;
- database values;
- API enum payloads;
- slugs;
- URLs;
- email addresses;
- phone numbers;
- media filenames;
- user-entered content;
- client/lead names;
- stored navigation labels authored as site content;
- permission keys;
- setting keys;
- locale codes;
- internal logs intended only for developers.

Only translate their surrounding Admin UI labels when appropriate.

---

# 28. Do not regress the recently completed UX work

This closure must NOT regress:

## Media Picker

Preserve:

- reusable Media Browser;
- folders;
- server-side search;
- pagination;
- Grid/List;
- MIME filtering;
- selected asset loading by ID;
- compact thumbnail presentation.

## Admin Filter Bar

Preserve:

- compact desktop controls;
- dedicated search width;
- filter control widths;
- responsive mobile full-width behavior;
- advanced filters;
- reset behavior.

Do not solve localization by reverting those components.

---

# 29. Static repository audit

Before declaring completion, run a source audit for likely hard-coded Admin UI strings.

Use tools such as `rg` to inspect JSX/TSX strings.

Examples:

```bash
rg -n \
  --glob 'apps/admin/**/*.{ts,tsx}' \
  '>[[:space:]]*[A-Z][^<{]*<' \
  apps/admin
```

Also search common props:

```bash
rg -n \
  --glob 'apps/admin/**/*.{ts,tsx}' \
  '(placeholder|aria-label|title)=["'\''][A-Za-z]' \
  apps/admin
```

And known remnants:

```bash
rg -n \
  'Previous|Next|Global Settings|Navigation Builder|Account details|Activity timeline|Upload failed|Archive failed|No sections yet|Workflow status' \
  apps/admin packages/ui/src
```

These searches are discovery aids, not proof by themselves.

Review results manually.

Legitimate developer-only strings/comments/internal values may remain.

---

# 30. Automated translation parity test

Strengthen:

```text
apps/admin/lib/i18n/i18n.test.ts
```

At minimum enforce:

1. Every English translation key exists in Arabic.
2. Every Arabic translation key exists in English.
3. No duplicate/invalid key behavior.
4. Unknown-key fallback behavior is tested genuinely.
5. Locale normalization behaves correctly.
6. `ar` resolves RTL.
7. `en` resolves LTR.

Do not write a fake fallback test using a key that already exists in both dictionaries.

---

# 31. Add focused component tests

Add tests where practical for critical localization behavior.

At minimum cover:

## Locale provider / toggle

- English -> Arabic.
- Arabic -> English.
- cookie/update behavior according to existing architecture.
- `lang`.
- `dir`.

## Data Table

- translated filter labels;
- translated Pagination labels;
- distinct Sales page titles.

## Media Picker

- localized dialog title;
- localized search/action labels;
- localized error state;
- accessible `aria-labelledby`.

Do not over-test implementation details.

Test user-observable behavior.

---

# 32. E2E / manual QA matrix

If the repository already has an E2E framework, add automated coverage.

If not, perform and document manual QA at minimum.

Test both:

```text
English / LTR
Arabic / RTL
```

for these routes:

```text
/dashboard

/content/pages
/content/services
/content/industries
/content/case-studies
/content/insights

/media

/website/navigation
/website/languages
/website/settings
/website/redirects

/sales/leads
/sales/consultation
/sales/assessments

/system/users
/system/roles

/login
```

For each representative page verify:

- heading;
- sidebar;
- breadcrumbs if present;
- filters;
- table columns;
- pagination;
- buttons;
- dialogs;
- empty states;
- errors;
- form labels;
- selects;
- status labels;
- save/publish actions;
- mobile layout;
- RTL alignment.

---

# 33. Media QA

In Arabic UI:

1. Open a content editor.
2. Open Media Picker.
3. Verify Arabic dialog title.
4. Verify RTL layout.
5. Search media.
6. Change folder.
7. Move between pages.
8. Toggle Grid/List.
9. Select an image.
10. Confirm selected item.
11. Reopen the picker.
12. Verify the current selection still resolves.
13. Trigger/inspect an upload error if safely testable.
14. Verify no English media status/error text appears.

Repeat a smoke pass in English.

---

# 34. Content Editor QA

In Arabic UI test at least:

```text
Page
Service
Industry
Case Study
Insight
```

Verify:

- Create/Edit heading.
- Tabs/sections.
- Relations.
- Content settings.
- Publishing.
- Workflow status.
- Section editor.
- Section type.
- Theme.
- Media chooser.
- Relation selectors.
- Empty states.
- Save.
- Publish.
- Validation.

The editor must not appear as mixed Arabic/English UI.

---

# 35. Responsive RTL QA

Test at minimum:

```text
Desktop >= 1280px
Tablet ~768px
Mobile ~390px
```

Verify:

- mobile drawer enters/exits from the correct RTL side;
- no horizontal overflow;
- filter controls remain usable;
- dialogs stay within viewport;
- button groups wrap cleanly;
- text does not overlap icons;
- tables remain navigable;
- language toggle remains reachable.

---

# 36. Build and quality gates

Run all relevant repository commands available in the project.

At minimum, expected Admin/API gates include:

```bash
pnpm --filter @gatevia/admin typecheck
pnpm --filter @gatevia/admin lint
pnpm --filter @gatevia/admin test
pnpm --filter @gatevia/admin build
```

If shared UI changes were made:

```bash
pnpm --filter @gatevia/ui typecheck
pnpm --filter @gatevia/ui lint
pnpm --filter @gatevia/ui build
```

If workspace scripts differ, use the repository's canonical equivalents.

Because Pagination may modify shared UI, verify all consumers still compile.

Run project-level checks where appropriate:

```bash
pnpm turbo build
```

If API/OpenAPI was untouched in this localization closure, do not make unnecessary API changes.

If any API/contracts change becomes genuinely necessary, run the corresponding API/contracts/OpenAPI checks.

---

# 37. Regression constraints

The implementation MUST NOT:

- modify database schema for localization;
- change business data;
- alter website frontend locale behavior;
- change public website content;
- change content locale selection semantics;
- break Media API contracts unnecessarily;
- remove pagination;
- remove folders;
- remove advanced filters;
- change permissions;
- weaken authorization;
- modify role semantics;
- translate persisted enum/API values;
- add machine translation of user content;
- duplicate the entire Admin UI per language;
- add a second competing i18n system.

---

# 38. Definition of Done

This closure is PASS only if ALL are true.

## Localization

- [ ] Arabic language switch works.
- [ ] English language switch works.
- [ ] Selected Admin locale persists using the existing architecture.
- [ ] `<html lang>` is correct.
- [ ] `<html dir>` is correct.
- [ ] No mixed English/Arabic Admin UI remains in Arabic mode.
- [ ] All major editors use i18n.
- [ ] All actions use i18n.
- [ ] All filters use i18n.
- [ ] All status labels use i18n.
- [ ] All errors use i18n.
- [ ] All empty/loading/success states use i18n.
- [ ] All relevant placeholders use i18n.
- [ ] All relevant accessibility labels use i18n.

## Critical screens

- [ ] Content Editor fully localized.
- [ ] Navigation Editor fully localized.
- [ ] Settings Editor fully localized.
- [ ] Redirect Editor fully localized.
- [ ] Language Editor fully localized.
- [ ] User Editor fully localized.
- [ ] Role Editor fully localized.
- [ ] Lead Detail fully localized.
- [ ] Auth surfaces fully localized.
- [ ] Media Library/Picker final strings localized.

## Known bugs

- [ ] Pagination Previous/Next localized.
- [ ] Generic Pagination accessibility label localized for Admin usage.
- [ ] Consultation page title is correct.
- [ ] Assessments page title is correct.
- [ ] Leads page title remains correct.
- [ ] Advanced filter aria-labels localized.
- [ ] Generated “All X records” English sentence removed.
- [ ] Media errors localized.
- [ ] Media statuses localized.
- [ ] Media dialog has valid localized `aria-labelledby`.
- [ ] Mobile menu `aria-controls` target exists.

## RTL

- [ ] Sidebar correct.
- [ ] Mobile drawer correct.
- [ ] Forms correct.
- [ ] Tables correct.
- [ ] Filters correct.
- [ ] Dialogs correct.
- [ ] Pagination correct.
- [ ] Directional icons correct.
- [ ] No horizontal RTL regression.

## Quality

- [ ] Translation dictionaries have key parity.
- [ ] Genuine fallback test passes.
- [ ] Admin typecheck passes.
- [ ] Admin lint passes.
- [ ] Admin tests pass.
- [ ] Admin build passes.
- [ ] Shared UI checks pass if modified.
- [ ] Repository diff check is clean.
- [ ] No unrelated refactor is included.

---

# 39. Required final repository search before PASS

Before reporting completion, perform a final audit.

Search Admin TS/TSX for remaining obvious English UI strings.

Do not automatically replace every English token.

Classify every result into one of:

```text
A. Admin-visible UI -> MUST localize.
B. User/business data -> leave unchanged.
C. Developer-only/internal/API value -> leave unchanged.
D. False positive/comment/import/type -> ignore.
```

The final report must state how many unresolved category-A findings remain.

Required result:

```text
0 unresolved Admin-visible hard-coded English findings in audited scope
```

Anything above zero means the task is NOT closed.

---

# 40. Required final agent report

When implementation is finished, return a closure report using this exact structure.

```md
# GATEVIA ADMIN ARABIC / RTL — FINAL CLOSURE REPORT

## Status
PASS / FAIL

## Baseline
- Branch:
- Baseline SHA:
- Final SHA:

## Files changed
- ...

## Localization coverage
- Shell:
- Dashboard:
- Content editors:
- Navigation:
- Settings:
- Redirects:
- Languages:
- Users:
- Roles:
- Leads/Sales:
- Media:
- Authentication:
- Pagination:
- Accessibility:

## Known closure items
- Pagination localization: PASS/FAIL
- Sales route titles: PASS/FAIL
- Advanced filter labels: PASS/FAIL
- Media errors/statuses: PASS/FAIL
- Media dialog aria-labelledby: PASS/FAIL
- Mobile sidebar aria-controls: PASS/FAIL

## RTL QA
- Desktop:
- Tablet:
- Mobile:

## Static hard-coded-string audit
- Admin-visible unresolved English strings: 0 / N
- Notes / allowed internal exceptions:

## Tests
- i18n tests:
- Admin typecheck:
- Admin lint:
- Admin tests:
- Admin build:
- Shared UI checks:
- Turbo/workspace build:

## Manual route QA
- /dashboard:
- /content/pages:
- /content/services:
- /content/industries:
- /media:
- /website/navigation:
- /website/languages:
- /website/settings:
- /website/redirects:
- /sales/leads:
- /sales/consultation:
- /sales/assessments:
- /system/users:
- /system/roles:
- /login:

## Regression statement
Confirm that content locale behavior, API payload values, permissions,
Media Browser behavior, Admin Filter Bar behavior, and public website behavior
were not changed unintentionally.

## Final conclusion
State explicitly whether this version is ready to deploy.
```

---

# 41. Final instruction to the implementation agent

Do not report PASS because the language toggle works.

Do not report PASS because the Sidebar is translated.

Do not report PASS while core editors still contain English UI.

The closure target is:

> **When an administrator selects Arabic, the complete Admin experience is coherent Arabic + RTL, with no user-facing English remnants except business/user content that is intentionally English.**

Fix the remaining localization gaps, run the required audits and quality gates, and return the closure report above.

**Do not deploy. Do not push/merge/tag unless explicitly instructed.**
