'use client';
import { useEffect, useRef, useState } from 'react';
import { Button, Field, Input, Textarea } from '@gatevia/ui';
import { publicApiUrl } from '@/lib/api';
import { copy } from '@/lib/ui-copy';
import { track } from './analytics';

type Kind = 'contact' | 'consultation' | 'market-entry-assessment';
type SubmitState = 'idle' | 'sending' | 'success' | 'error';

// ─── UTM capture ─────────────────────────────────────────────────────────────

interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

function captureUtm(): UtmParams {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const utm: UtmParams = {};
  const keys: (keyof UtmParams)[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  keys.forEach((k) => {
    const v = params.get(k);
    if (v) utm[k] = v;
  });
  // Merge with session-stored UTM (first-touch attribution)
  try {
    const stored = JSON.parse(sessionStorage.getItem('gatevia_utm') ?? '{}') as UtmParams;
    // Session values are first-touch; URL values override (last-touch for explicit campaigns).
    const merged: UtmParams = { ...stored, ...utm };
    if (Object.keys(utm).length > 0) {
      sessionStorage.setItem('gatevia_utm', JSON.stringify(merged));
    }
    return merged;
  } catch {
    return utm;
  }
}

function persistUtm(utm: UtmParams) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem('gatevia_utm', JSON.stringify(utm));
  } catch { /* ignore */ }
}

function mapUtm(utm: UtmParams) {
  return {
    utmSource: utm.utm_source,
    utmMedium: utm.utm_medium,
    utmCampaign: utm.utm_campaign,
    utmTerm: utm.utm_term,
    utmContent: utm.utm_content,
  };
}

// ─── Multi-step Assessment ────────────────────────────────────────────────────

const ASSESSMENT_STEPS = [
  'Company',
  'Business',
  'Objective',
  'Support',
  'Contact',
  'Review',
] as const;

type AssessmentStep = (typeof ASSESSMENT_STEPS)[number];

interface AssessmentData {
  // Step 1 — Company
  companyName: string;
  countryCode: string;
  website: string;
  // Step 2 — Business
  currentSaudiPresence: string;
  industryId: string;
  // Step 3 — Objective
  objective: string;
  timeline: string;
  // Step 4 — Support
  needs: string[];
  notes: string;
  // Step 5 — Contact
  fullName: string;
  email: string;
  phone: string;
  preferredLocale: string;
  consent: boolean;
}

const INITIAL_ASSESSMENT: AssessmentData = {
  companyName: '',
  countryCode: '',
  website: '',
  currentSaudiPresence: 'none',
  industryId: '',
  objective: 'research',
  timeline: '3_6_months',
  needs: ['research'],
  notes: '',
  fullName: '',
  email: '',
  phone: '',
  preferredLocale: 'en',
  consent: false,
};

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="step-progress" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`step-dot${i < current - 1 ? ' step-dot--done' : i === current - 1 ? ' step-dot--active' : ''}`}
        />
      ))}
    </div>
  );
}

function validateStep(step: AssessmentStep, data: AssessmentData): string | null {
  switch (step) {
    case 'Company':
      if (!data.companyName.trim()) return 'Company name is required.';
      return null;
    case 'Business':
      return null;
    case 'Objective':
      return null;
    case 'Support':
      return null;
    case 'Contact':
      if (!data.fullName.trim()) return 'Full name is required.';
      if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'A valid email is required.';
      if (!data.consent) return 'You must agree to the privacy notice.';
      return null;
    case 'Review':
      return null;
  }
}

function AssessmentForm({ locale }: { locale: string }) {
  const [step, setStep] = useState<number>(1);
  const [data, setData] = useState<AssessmentData>({ ...INITIAL_ASSESSMENT, preferredLocale: locale });
  const [error, setError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [utm, setUtm] = useState<UtmParams>({});
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const captured = captureUtm();
    setUtm(captured);
    persistUtm(captured);
  }, []);

  useEffect(() => {
    track('assessment_start', { locale });
  }, [locale]);

  const totalSteps = ASSESSMENT_STEPS.length;
  const currentStepName = ASSESSMENT_STEPS[step - 1];
  const isLast = step === totalSteps;

  function next() {
    const err = validateStep(currentStepName, data);
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => Math.min(s + 1, totalSteps));
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function toggle(need: string) {
    setData((d) => ({
      ...d,
      needs: d.needs.includes(need) ? d.needs.filter((n) => n !== need) : [...d.needs, need],
    }));
  }

  function field<K extends keyof AssessmentData>(key: K) {
    return (value: AssessmentData[K]) => setData((d) => ({ ...d, [key]: value }));
  }

  async function submit() {
    const err = validateStep('Contact', data);
    if (err) { setError(err); return; }
    setError(null);
    setSubmitState('sending');

    const payload = {
      contact: { fullName: data.fullName, email: data.email, phone: data.phone || undefined },
      company: { name: data.companyName, countryCode: data.countryCode || 'unknown', website: data.website || undefined },
      business: {
        currentSaudiPresence: data.currentSaudiPresence,
        industryId: data.industryId || undefined,
        objective: data.objective,
        timeline: data.timeline,
        needs: data.needs,
        notes: data.notes || undefined,
      },
      consent: data.consent,
      submissionLocale: locale,
      preferredLocale: data.preferredLocale || locale,
      sourcePage: location.pathname,
      sourceUrl: location.href,
      referrer: document.referrer || undefined,
      landingPage: sessionStorage.getItem('gatevia_landing') ?? location.href,
      ...mapUtm(utm),
    };

    try {
      const response = await fetch(`${publicApiUrl}/public/forms/market-entry-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('submit');
      setSubmitState('success');
      track('assessment_complete', { locale });
    } catch {
      setSubmitState('error');
    }
  }

  if (submitState === 'success') {
    return (
      <div className="form-status" role="status" style={{ padding: '2rem', textAlign: 'center' }}>
        <strong style={{ display: 'block', marginBlockEnd: '.5rem', fontSize: '1.2rem' }}>
          Assessment received ✓
        </strong>
        <p>Our team will review your profile and be in touch shortly.</p>
      </div>
    );
  }

  return (
    <div ref={topRef}>
      <StepProgress current={step} total={totalSteps} />
      <p className="cell-meta" style={{ marginBlockEnd: '1rem' }}>
        Step {step} of {totalSteps} — {currentStepName}
      </p>

      {/* Step 1: Company */}
      {step === 1 && (
        <div className="form-grid">
          <Field label="Company name *">
            <Input value={data.companyName} onChange={(e) => field('companyName')(e.target.value)} required maxLength={160} />
          </Field>
          <Field label="Country">
            <Input value={data.countryCode} onChange={(e) => field('countryCode')(e.target.value)} maxLength={8} placeholder="e.g. AE, GB, US" />
          </Field>
          <Field label="Website">
            <Input type="url" dir="ltr" value={data.website} onChange={(e) => field('website')(e.target.value)} maxLength={300} placeholder="https://..." />
          </Field>
        </div>
      )}

      {/* Step 2: Business */}
      {step === 2 && (
        <div className="form-grid">
          <Field label="Current Saudi Arabia presence">
            <select className="gv-input" value={data.currentSaudiPresence} onChange={(e) => field('currentSaudiPresence')(e.target.value)}>
              <option value="none">No presence yet</option>
              <option value="exploring">Exploring / researching</option>
              <option value="operating">Already operating</option>
            </select>
          </Field>
        </div>
      )}

      {/* Step 3: Objective */}
      {step === 3 && (
        <div className="form-grid">
          <Field label="Primary objective">
            <select className="gv-input" value={data.objective} onChange={(e) => field('objective')(e.target.value)}>
              <option value="research">Market research</option>
              <option value="setup">Company setup / registration</option>
              <option value="partner_search">Local partner search</option>
              <option value="growth">Business growth / expansion</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Target timeline">
            <select className="gv-input" value={data.timeline} onChange={(e) => field('timeline')(e.target.value)}>
              <option value="immediate">Immediate (under 1 month)</option>
              <option value="1_3_months">1–3 months</option>
              <option value="3_6_months">3–6 months</option>
              <option value="6_plus_months">6+ months</option>
            </select>
          </Field>
        </div>
      )}

      {/* Step 4: Support needed */}
      {step === 4 && (
        <div className="form-grid">
          <Field label="What support do you need?">
            {[
              ['research', 'Market research & intelligence'],
              ['company_formation', 'Company formation & legal setup'],
              ['local_partner', 'Local partner identification'],
              ['licensing', 'Licensing & regulatory compliance'],
              ['gtm', 'Go-to-market strategy & execution'],
              ['other', 'Other support'],
            ].map(([value, label]) => (
              <label key={value} style={{ display: 'block', marginBlock: '.3rem' }}>
                <input
                  type="checkbox"
                  checked={data.needs.includes(value)}
                  onChange={() => toggle(value)}
                />{' '}
                {label}
              </label>
            ))}
          </Field>
          <Field label="Additional notes (optional)">
            <Textarea
              value={data.notes}
              onChange={(e) => field('notes')(e.target.value)}
              maxLength={5000}
              placeholder="Any specific context or questions for our team…"
            />
          </Field>
        </div>
      )}

      {/* Step 5: Contact */}
      {step === 5 && (
        <div className="form-grid">
          <Field label="Full name *">
            <Input value={data.fullName} onChange={(e) => field('fullName')(e.target.value)} required maxLength={120} />
          </Field>
          <Field label="Work email *">
            <Input type="email" value={data.email} onChange={(e) => field('email')(e.target.value)} required maxLength={254} />
          </Field>
          <Field label="Phone (optional)">
            <Input type="tel" value={data.phone} onChange={(e) => field('phone')(e.target.value)} maxLength={40} />
          </Field>
          <Field label="Preferred language for follow-up">
            <select className="gv-input" value={data.preferredLocale} onChange={(e) => field('preferredLocale')(e.target.value)}>
              <option value="en">English</option>
              <option value="ar-SA">العربية</option>
            </select>
          </Field>
          <div>
            <label>
              <input
                type="checkbox"
                checked={data.consent}
                onChange={(e) => field('consent')(e.target.checked)}
                required
              />{' '}
              {copy(locale).privacy}
            </label>
          </div>
        </div>
      )}

      {/* Step 6: Review */}
      {step === 6 && (
        <div className="panel" style={{ fontSize: '.9rem' }}>
          <h3 style={{ marginBlockStart: 0 }}>Review your assessment</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                ['Company', data.companyName],
                ['Country', data.countryCode || '—'],
                ['Saudi presence', data.currentSaudiPresence],
                ['Objective', data.objective],
                ['Timeline', data.timeline],
                ['Support needed', data.needs.join(', ')],
                ['Name', data.fullName],
                ['Email', data.email],
                ['Phone', data.phone || '—'],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{ padding: '.4rem .6rem .4rem 0', color: 'var(--color-text-muted)', width: '40%' }}>{label}</td>
                  <td style={{ padding: '.4rem 0' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && (
        <div className="form-status form-status--error" role="alert" style={{ marginBlockStart: '1rem' }}>
          {error}
        </div>
      )}

      {submitState === 'error' && (
        <div className="form-status form-status--error" role="alert" style={{ marginBlockStart: '1rem' }}>
          {copy(locale).error}
        </div>
      )}

      <div className="step-nav">
        <div>
          {step > 1 && (
            <button type="button" className="text-link" onClick={back}>
              ← Back
            </button>
          )}
        </div>
        {isLast ? (
          <Button disabled={submitState === 'sending'} onClick={submit}>
            {submitState === 'sending' ? copy(locale).sending : 'Submit assessment'}
          </Button>
        ) : (
          <Button onClick={next}>Next →</Button>
        )}
      </div>
    </div>
  );
}

// ─── Simple forms (contact / consultation) ────────────────────────────────────

function SimpleForm({ kind, locale }: { kind: 'contact' | 'consultation'; locale: string }) {
  const t = copy(locale);
  const [state, setState] = useState<SubmitState>('idle');
  const [utm, setUtm] = useState<UtmParams>({});

  useEffect(() => {
    const captured = captureUtm();
    setUtm(captured);
    persistUtm(captured);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    const data = new FormData(event.currentTarget);
    const base = {
      fullName: data.get('fullName'),
      companyName: data.get('companyName') || undefined,
      email: data.get('email'),
      phone: data.get('phone') || undefined,
      countryCode: data.get('countryCode') || undefined,
      message: data.get('message') || '',
      consent: data.get('consent') === 'on',
      submissionLocale: locale,
      sourcePage: location.pathname,
      sourceUrl: location.href,
      referrer: document.referrer || undefined,
      landingPage: sessionStorage.getItem('gatevia_landing') ?? location.href,
      website: String(data.get('website') || ''),
      ...mapUtm(utm),
    };
    const body =
      kind === 'consultation'
        ? { ...base, companyStage: data.get('companyStage') || undefined, timeline: data.get('timeline') || undefined }
        : base;
    try {
      const response = await fetch(`${publicApiUrl}/public/forms/${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('submit');
      setState('success');
      track(`${kind}_submit`, { locale });
      (event.currentTarget as HTMLFormElement).reset();
    } catch {
      setState('error');
    }
  }

  return (
    <form className="form-shell" onSubmit={submit} noValidate>
      <div className="form-grid">
        <Field label={locale.startsWith('ar') ? 'الاسم الكامل' : 'Full name'}>
          <Input name="fullName" required maxLength={120} />
        </Field>
        <Field label={locale.startsWith('ar') ? 'الشركة' : 'Company'}>
          <Input name="companyName" maxLength={160} />
        </Field>
        <Field label={locale.startsWith('ar') ? 'البريد الإلكتروني' : 'Email'}>
          <Input type="email" name="email" required maxLength={254} />
        </Field>
        <Field label={locale.startsWith('ar') ? 'الهاتف' : 'Phone'}>
          <Input type="tel" name="phone" maxLength={40} />
        </Field>
        <Field label={locale.startsWith('ar') ? 'الدولة' : 'Country'}>
          <Input name="countryCode" maxLength={8} />
        </Field>
        {kind === 'consultation' && (
          <>
            <Field label="Company stage">
              <Input name="companyStage" maxLength={120} />
            </Field>
            <Field label="Timeline">
              <Input name="timeline" maxLength={120} />
            </Field>
          </>
        )}
      </div>
      <Field label={locale.startsWith('ar') ? 'الرسالة' : 'Message'}>
        <Textarea name="message" required minLength={10} maxLength={5000} />
      </Field>
      <label>
        <input type="checkbox" name="consent" required /> {t.privacy}
      </label>
      <Button disabled={state === 'sending'} type="submit">
        {state === 'sending' ? t.sending : t.submit}
      </Button>
      {state === 'success' && (
        <div className="form-status form-status--success" role="status">{t.success}</div>
      )}
      {state === 'error' && (
        <div className="form-status form-status--error" role="alert">{t.error}</div>
      )}
      {/* Honeypot */}
      <input name="website" tabIndex={-1} autoComplete="off" hidden />
    </form>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function LeadForm({ kind, locale }: { kind: Kind; locale: string }) {
  if (kind === 'market-entry-assessment') {
    return (
      <div className="form-shell">
        <AssessmentForm locale={locale} />
      </div>
    );
  }
  return <SimpleForm kind={kind} locale={locale} />;
}
