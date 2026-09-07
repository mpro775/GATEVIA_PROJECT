# GATEVIA — Admin Panel Specification
**Document ID:** GTV-ADMIN-001  
**Version:** v0.2 Draft  
**Status:** Functional Contract

---

## 1. Goal

لوحة الإدارة أداة تشغيل يومية حقيقية لفريق GATEVIA، وليست مجرد CRUD تقني.

## 2. Main Navigation

```text
Dashboard

Content
├── Pages
├── Services
├── Service Categories
├── Industries
├── Case Studies
├── Insights
├── FAQs
└── Team

Trust & Ecosystem
├── Clients
├── Partners
├── Brands
├── Products & Ventures
├── Testimonials
├── Certifications
└── Trust Metrics

Sales
├── Leads
├── Consultation Requests
└── Assessments

Media
└── Media Library

Website
├── Navigation
├── Footer / Global Content
├── Languages
├── SEO
├── Redirects
└── General Settings

System
├── Users
├── Roles & Permissions
├── Audit Log
└── System Health (optional)
```

## 3. Dashboard

Recommended widgets:
- Leads Today.
- Leads This Month.
- New Leads.
- Qualified Leads.
- Top Source.
- Top Requested Service.
- Content Drafts.
- Recently Published.
- Media Storage Usage optional.

## 4. Content List UX

Every list should support:
- Search.
- Filters.
- Sort.
- Pagination.
- Status.
- Featured.
- Translation completeness.
- Bulk actions where safe.

## 5. Edit Form UX

Use:
- Clear sections.
- Locale tabs.
- Preview.
- Status selector.
- SEO panel.
- Relations panel.
- Media picker.
- Sticky save bar if useful.

## 6. Publishing Controls

Actions:
- Save Draft.
- Submit for Review optional.
- Publish.
- Archive.
- Preview.

No accidental publish.

## 7. Language UX

Example:
```text
AR ✓
EN ✓
FR ⚠
```

Show missing required fields per locale.

## 8. Media UX

- Drag & Drop.
- Picker.
- Folders.
- Preview.
- Alt Text.
- Usage.
- Replace.
- Safe Delete.

## 9. Leads UX

List columns:
- Name.
- Company.
- Source.
- Service.
- Country.
- Status.
- Assignee.
- Date.

Lead Detail:
- Contact Info.
- Source / UTM.
- Form Answers.
- Status.
- Assignee.
- Notes.
- Timeline.

## 10. Assessment UX

Display answers as grouped readable sections, never raw JSON.

## 11. Navigation Builder

Allow:
- Add Item.
- Link Internal Content.
- External URL.
- Nested Items.
- Sort.
- Locale Labels.
- Visibility.

## 12. SEO UX

Per content:
- Title.
- Meta Description.
- OG Fields.
- Canonical.
- NoIndex.
- Preview Snippet optional.

## 13. Roles

### Super Admin
Full access.

### Content Manager
CMS + Media.

### Marketing
Content + SEO + limited analytics settings.

### Sales
Leads only + basic read access where needed.

### Viewer
Read-only.

## 14. Permissions

Example permissions:
```text
pages.read
pages.create
pages.update
pages.publish
pages.archive

leads.read
leads.assign
leads.update_status
leads.export

media.upload
media.delete

settings.manage
users.manage
roles.manage
```

## 15. Audit Log

Track:
- User.
- Action.
- Entity.
- Entity ID.
- Timestamp.
- Before/After summary optional.

## 16. Error UX

Errors must be:
- Clear.
- Actionable.
- Without raw stack traces.

## 17. Empty States

Each module explains:
- What it is.
- How to create the first record.

## 18. Confirmation

Require confirmation for:
- Permanent Delete.
- Archive of critical items.
- Media Delete.
- Role changes.
- Lead Export optional.

## 19. Security UX

- Password Reset.
- Session Handling.
- MFA optional.
- Logout All Sessions optional future.

## 20. Responsive Admin

- Desktop-first.
- Tablet usable.
- Mobile supports basic operations.

## 21. Admin Performance

Large tables:
- Server-side pagination.
- Efficient filters.
- Never load all records client-side.

## 22. Client Decisions

- [ ] Review Workflow؟
- [ ] MFA Required؟
- [ ] Sales sees all leads or assigned only؟
- [ ] Export Required؟
- [ ] System Health Needed؟
- [ ] Audit visible to Super Admin only؟
