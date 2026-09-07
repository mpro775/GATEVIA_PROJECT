# GATEVIA — Leads / CRM Contract
**Document ID:** GTV-CRM-001  
**Version:** v0.2 Draft  
**Status:** Functional / Technical Contract

---

## 1. Objective

توفير طبقة CRM خفيفة لإدارة العملاء المحتملين الناتجين من الموقع، دون تحويل V1 إلى CRM مؤسسي كامل.

## 2. Lead Sources

Supported:
- Contact Form.
- Consultation Request.
- Market Entry Assessment.
- Landing Page.
- Manual Entry optional.

Store:
- source_type.
- source_page.
- source_url.
- submission_locale.

## 3. Lead Fields

Core:
- id.
- full_name.
- company_name.
- email.
- phone.
- country.
- preferred_locale.
- industry_id optional.
- service_id optional.
- message.
- source_type.
- status.
- assigned_to_user_id.
- created_at.
- updated_at.

Marketing attribution:
- utm_source.
- utm_medium.
- utm_campaign.
- utm_term.
- utm_content.
- referrer.
- landing_page.

## 4. Lead Statuses

Recommended:
```text
new
contacted
qualified
proposal
won
lost
```

Optional:
- unqualified.
- follow_up.
- on_hold.

## 5. Lead Activity Timeline

Track:
- Created.
- Status Changed.
- Assigned.
- Note Added.
- Notification Sent.
- Assessment Submitted.
- Export optional.

## 6. Internal Notes

- Staff only.
- Author.
- Timestamp.
- Body.
- Never visible to public user.

## 7. Assignment

Lead may be:
- Unassigned.
- Assigned to one user.

Team-based assignment is future scope unless approved.

## 8. Contact Form

Fields:
- Name.
- Company.
- Email.
- Phone.
- Country.
- Subject.
- Message.
- Consent checkbox if required.

## 9. Consultation Request

Fields:
- Name.
- Company.
- Business Email.
- Phone.
- Country.
- Service.
- Company Stage.
- Timeline.
- Message.

## 10. Market Entry Assessment

### Step 1 — Company
- Company Name.
- Website optional.
- Country.

### Step 2 — Business
- Industry.
- Company Size optional.
- Current Saudi Presence.

### Step 3 — Objective
- Research.
- Setup.
- Partner Search.
- Growth.
- Other.

### Step 4 — Timing
- Immediate.
- 1–3 Months.
- 3–6 Months.
- 6+ Months.

### Step 5 — Needs
- Company Formation.
- Licensing.
- Research.
- Local Partner.
- GTM.
- Other.

### Step 6 — Contact
- Name.
- Email.
- Phone.

## 11. Assessment Storage

Store:
- assessment_id.
- lead_id.
- answers.
- form_version.
- submitted_at.

Use structured schema, not uncontrolled raw payload only.

## 12. Spam Protection

Required:
- Server-side validation.
- Honeypot or CAPTCHA strategy.
- Rate limiting.
- Duplicate submission handling.
- Abuse monitoring where appropriate.

## 13. Notifications

On new lead:
- Internal email notification.

Optional future integrations:
- Slack.
- WhatsApp.
- External CRM webhook.

## 14. Lead Emails

Optional user confirmation:
> We received your request.

No response-time promise unless approved.

## 15. Filters

Admin filters:
- Status.
- Source.
- Service.
- Industry.
- Country.
- Assignee.
- Date.
- UTM Source.

## 16. Search

Search by:
- Name.
- Company.
- Email.
- Phone.

## 17. Export

If approved:
- CSV.
- XLSX.

Permission controlled.

## 18. Privacy

Lead data is private.
Public API must never expose lead information.

## 19. Duplicate Detection

Do not auto-merge blindly.
Flag potential duplicate by:
- Same email.
- Same phone.

Admin decides.

## 20. Retention

Retention period must be approved with privacy/legal policy.

## 21. Conversion Metrics

Dashboard may show:
- Total Leads.
- New Leads.
- Qualified Leads.
- Leads by Source.
- Leads by Service.
- Leads by Country.

Advanced forecasting is out of scope.

## 22. CRM Boundaries

Not included:
- Email Campaigns.
- Automated Sequences.
- Pipeline Automation.
- External CRM Sync.
- Sales Forecasting.
- Quote Generator.
- Contracts.

## 23. Client Decisions

- [ ] Final Status List.
- [ ] Auto-confirmation Email؟
- [ ] Export Required؟
- [ ] Assignment Required؟
- [ ] Assessment Final Questions.
- [ ] Response SLA Text.
- [ ] Retention Period.
- [ ] External CRM Integration؟
