'use client';
import { useEffect, useRef, useState } from 'react';
import type { ContentRecord, Language } from '@gatevia/api-client';
import { Button, Checkbox, Field, Icon, Input, Textarea } from '@gatevia/ui';
import { apiClient, getLanguages, getList } from '@/lib/api';
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
type FormLanguage = Pick<Language, 'code' | 'nativeName'>;
type IndustryOption = ContentRecord & {
  id: string;
  translations?: Array<{ name?: string; title?: string }>;
};

function captureUtm(): UtmParams {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const utm: UtmParams = {};
  const keys: (keyof UtmParams)[] = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
  ];
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
  } catch {
    /* ignore */
  }
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

function validateStep(step: AssessmentStep, data: AssessmentData, ar = false): string | null {
  switch (step) {
    case 'Company':
      if (!data.companyName.trim()) return ar ? 'اسم الشركة مطلوب.' : 'Company name is required.';
      return null;
    case 'Business':
      if (!data.industryId) return ar ? 'اختيار القطاع مطلوب.' : 'Industry is required.';
      return null;
    case 'Objective':
      return null;
    case 'Support':
      return null;
    case 'Contact':
      if (!data.fullName.trim()) return ar ? 'الاسم الكامل مطلوب.' : 'Full name is required.';
      if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        return ar ? 'أدخل بريدًا إلكترونيًا صحيحًا.' : 'A valid email is required.';
      if (!data.consent)
        return ar ? 'يجب الموافقة على إشعار الخصوصية.' : 'You must agree to the privacy notice.';
      return null;
    case 'Review':
      return null;
  }
}

function AssessmentForm({ locale }: { locale: string }) {
  const ar = locale.toLowerCase().startsWith('ar');
  const labels = ar
    ? {
        steps: ['الشركة', 'النشاط', 'الهدف', 'الدعم', 'التواصل', 'المراجعة'],
        step: 'الخطوة',
        of: 'من',
        companyName: 'اسم الشركة *',
        country: 'الدولة',
        countryHint: 'مثال: SA، AE، GB',
        website: 'الموقع الإلكتروني',
        presence: 'التواجد الحالي في السعودية',
        noPresence: 'لا يوجد تواجد بعد',
        exploring: 'في مرحلة الاستكشاف أو البحث',
        operating: 'نعمل حاليًا في السوق',
        industry: 'القطاع *',
        selectIndustry: '— اختر القطاع —',
        objective: 'الهدف الرئيسي',
        research: 'دراسة السوق',
        setup: 'تأسيس الشركة وتسجيلها',
        partner: 'البحث عن شريك محلي',
        growth: 'النمو والتوسع',
        other: 'أخرى',
        targetTimeline: 'المدة المستهدفة',
        immediate: 'فوري (أقل من شهر)',
        months13: 'من شهر إلى 3 أشهر',
        months36: 'من 3 إلى 6 أشهر',
        months6: 'أكثر من 6 أشهر',
        support: 'ما الدعم الذي تحتاجه؟',
        supportOptions: [
          'أبحاث السوق والمعلومات',
          'تأسيس الشركة والإعداد القانوني',
          'تحديد الشريك المحلي',
          'التراخيص والامتثال التنظيمي',
          'استراتيجية دخول السوق وتنفيذها',
          'دعم آخر',
        ],
        notes: 'ملاحظات إضافية (اختياري)',
        notesHint: 'أي سياق أو أسئلة محددة لفريقنا…',
        fullName: 'الاسم الكامل *',
        email: 'البريد الإلكتروني للعمل *',
        phone: 'الهاتف (اختياري)',
        preferred: 'لغة التواصل المفضلة',
        review: 'راجع بيانات التقييم',
        reviewLabels: [
          'الشركة',
          'الدولة',
          'التواجد في السعودية',
          'القطاع',
          'الهدف',
          'المدة',
          'الدعم المطلوب',
          'الاسم',
          'البريد الإلكتروني',
          'الهاتف',
        ],
        back: 'رجوع',
        next: 'التالي',
        submit: 'إرسال التقييم',
        received: 'تم استلام التقييم ✓',
        receivedBody: 'سيراجع فريقنا بياناتك ويتواصل معك قريبًا.',
      }
    : {
        steps: ['Company', 'Business', 'Objective', 'Support', 'Contact', 'Review'],
        step: 'Step',
        of: 'of',
        companyName: 'Company name *',
        country: 'Country',
        countryHint: 'e.g. AE, GB, US',
        website: 'Website',
        presence: 'Current Saudi Arabia presence',
        noPresence: 'No presence yet',
        exploring: 'Exploring / researching',
        operating: 'Already operating',
        industry: 'Industry *',
        selectIndustry: '— Select industry —',
        objective: 'Primary objective',
        research: 'Market research',
        setup: 'Company setup / registration',
        partner: 'Local partner search',
        growth: 'Business growth / expansion',
        other: 'Other',
        targetTimeline: 'Target timeline',
        immediate: 'Immediate (under 1 month)',
        months13: '1–3 months',
        months36: '3–6 months',
        months6: '6+ months',
        support: 'What support do you need?',
        supportOptions: [
          'Market research & intelligence',
          'Company formation & legal setup',
          'Local partner identification',
          'Licensing & regulatory compliance',
          'Go-to-market strategy & execution',
          'Other support',
        ],
        notes: 'Additional notes (optional)',
        notesHint: 'Any specific context or questions for our team…',
        fullName: 'Full name *',
        email: 'Work email *',
        phone: 'Phone (optional)',
        preferred: 'Preferred language for follow-up',
        review: 'Review your assessment',
        reviewLabels: [
          'Company',
          'Country',
          'Saudi presence',
          'Industry',
          'Objective',
          'Timeline',
          'Support needed',
          'Name',
          'Email',
          'Phone',
        ],
        back: 'Back',
        next: 'Next',
        submit: 'Submit assessment',
        received: 'Assessment received ✓',
        receivedBody: 'Our team will review your profile and be in touch shortly.',
      };
  const [step, setStep] = useState<number>(1);
  const [data, setData] = useState<AssessmentData>({
    ...INITIAL_ASSESSMENT,
    preferredLocale: locale,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [utm, setUtm] = useState<UtmParams>({});
  const [languages, setLanguages] = useState<FormLanguage[]>([]);
  const [industries, setIndustries] = useState<IndustryOption[]>([]);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const captured = captureUtm();
    setUtm(captured);
    persistUtm(captured);
  }, []);

  useEffect(() => {
    track('assessment_start', { locale });
  }, [locale]);

  useEffect(() => {
    void Promise.all([getLanguages(), getList('industries', locale, '&pageSize=100')])
      .then(([languageResult, industryResult]) => {
        setLanguages(languageResult);
        setIndustries(industryResult as IndustryOption[]);
      })
      .catch(() => undefined);
  }, [locale]);

  const totalSteps = ASSESSMENT_STEPS.length;
  const currentStepName = ASSESSMENT_STEPS[step - 1] ?? 'Company';
  const isLast = step === totalSteps;

  function next() {
    const err = validateStep(currentStepName, data, ar);
    if (err) {
      setError(err);
      return;
    }
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
    const err = validateStep('Contact', data, ar);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSubmitState('sending');

    const payload = {
      contact: { fullName: data.fullName, email: data.email, phone: data.phone || undefined },
      company: {
        name: data.companyName,
        countryCode: data.countryCode || 'unknown',
        website: data.website || undefined,
      },
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
      const { error } = await apiClient.POST('/api/v1/public/forms/market-entry-assessment', {
        params: { header: { 'Idempotency-Key': crypto.randomUUID() } },
        body: payload as never,
      });
      if (error) {
        const message = (error as { detail?: string }).detail ?? 'Submission failed';
        throw new Error(message);
      }
      setSubmitState('success');
      track('assessment_complete', { locale });
    } catch {
      setSubmitState('error');
    }
  }

  if (submitState === 'success') {
    return (
      <div className="form-status form-success" role="status">
        <strong>{labels.received}</strong>
        <p>{labels.receivedBody}</p>
      </div>
    );
  }

  return (
    <div ref={topRef}>
      <StepProgress current={step} total={totalSteps} />
      <p className="cell-meta">
        {labels.step} {step} {labels.of} {totalSteps} — {labels.steps[step - 1]}
      </p>

      {/* Step 1: Company */}
      {step === 1 && (
        <div className="form-grid">
          <Field label={labels.companyName}>
            <Input
              value={data.companyName}
              onChange={(e) => field('companyName')(e.target.value)}
              required
              maxLength={160}
            />
          </Field>
          <Field label={labels.country}>
            <Input
              value={data.countryCode}
              onChange={(e) => field('countryCode')(e.target.value)}
              maxLength={8}
              placeholder={labels.countryHint}
            />
          </Field>
          <Field label={labels.website}>
            <Input
              type="url"
              dir="ltr"
              value={data.website}
              onChange={(e) => field('website')(e.target.value)}
              maxLength={300}
              placeholder="https://..."
            />
          </Field>
        </div>
      )}

      {/* Step 2: Business */}
      {step === 2 && (
        <div className="form-grid">
          <Field label={labels.presence}>
            <select
              className="gv-input"
              value={data.currentSaudiPresence}
              onChange={(e) => field('currentSaudiPresence')(e.target.value)}
            >
              <option value="none">{labels.noPresence}</option>
              <option value="exploring">{labels.exploring}</option>
              <option value="operating">{labels.operating}</option>
            </select>
          </Field>
          <Field label={labels.industry}>
            <select
              className="gv-input"
              value={data.industryId}
              onChange={(e) => field('industryId')(e.target.value)}
              required
            >
              <option value="">{labels.selectIndustry}</option>
              {industries.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.translations?.[0]?.name ??
                    industry.translations?.[0]?.title ??
                    industry.id}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {/* Step 3: Objective */}
      {step === 3 && (
        <div className="form-grid">
          <Field label={labels.objective}>
            <select
              className="gv-input"
              value={data.objective}
              onChange={(e) => field('objective')(e.target.value)}
            >
              <option value="research">{labels.research}</option>
              <option value="setup">{labels.setup}</option>
              <option value="partner_search">{labels.partner}</option>
              <option value="growth">{labels.growth}</option>
              <option value="other">{labels.other}</option>
            </select>
          </Field>
          <Field label={labels.targetTimeline}>
            <select
              className="gv-input"
              value={data.timeline}
              onChange={(e) => field('timeline')(e.target.value)}
            >
              <option value="immediate">{labels.immediate}</option>
              <option value="1_3_months">{labels.months13}</option>
              <option value="3_6_months">{labels.months36}</option>
              <option value="6_plus_months">{labels.months6}</option>
            </select>
          </Field>
        </div>
      )}

      {/* Step 4: Support needed */}
      {step === 4 && (
        <div className="form-grid">
          <Field label={labels.support}>
            {(
              [
                ['research', labels.supportOptions[0]],
                ['company_formation', labels.supportOptions[1]],
                ['local_partner', labels.supportOptions[2]],
                ['licensing', labels.supportOptions[3]],
                ['gtm', labels.supportOptions[4]],
                ['other', labels.supportOptions[5]],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="assessment-choice">
                <input
                  type="checkbox"
                  checked={data.needs.includes(value)}
                  onChange={() => toggle(value)}
                />{' '}
                {label}
              </label>
            ))}
          </Field>
          <Field label={labels.notes}>
            <Textarea
              value={data.notes}
              onChange={(e) => field('notes')(e.target.value)}
              maxLength={5000}
              placeholder={labels.notesHint}
            />
          </Field>
        </div>
      )}

      {/* Step 5: Contact */}
      {step === 5 && (
        <div className="form-grid">
          <Field label={labels.fullName}>
            <Input
              value={data.fullName}
              onChange={(e) => field('fullName')(e.target.value)}
              required
              maxLength={120}
            />
          </Field>
          <Field label={labels.email}>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => field('email')(e.target.value)}
              required
              maxLength={254}
            />
          </Field>
          <Field label={labels.phone}>
            <Input
              type="tel"
              value={data.phone}
              onChange={(e) => field('phone')(e.target.value)}
              maxLength={40}
            />
          </Field>
          <Field label={labels.preferred}>
            <select
              className="gv-input"
              value={data.preferredLocale}
              onChange={(e) => field('preferredLocale')(e.target.value)}
            >
              {(languages.length ? languages : [{ code: locale, nativeName: locale }]).map(
                (language) => (
                  <option key={language.code} value={language.code}>
                    {language.nativeName}
                  </option>
                ),
              )}
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
        <div className="panel assessment-review">
          <h3>{labels.review}</h3>
          <table>
            <tbody>
              {[
                [labels.reviewLabels[0], data.companyName],
                [labels.reviewLabels[1], data.countryCode || '—'],
                [labels.reviewLabels[2], data.currentSaudiPresence],
                [
                  labels.reviewLabels[3],
                  industries.find((industry) => industry.id === data.industryId)?.translations?.[0]
                    ?.name ?? data.industryId,
                ],
                [labels.reviewLabels[4], data.objective],
                [labels.reviewLabels[5], data.timeline],
                [labels.reviewLabels[6], data.needs.join(', ')],
                [labels.reviewLabels[7], data.fullName],
                [labels.reviewLabels[8], data.email],
                [labels.reviewLabels[9], data.phone || '—'],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td className="assessment-review__label">{label}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && (
        <div className="form-status form-status--error form-status--spaced" role="alert">
          {error}
        </div>
      )}

      {submitState === 'error' && (
        <div className="form-status form-status--error form-status--spaced" role="alert">
          {copy(locale).error}
        </div>
      )}

      <div className="step-nav">
        <div>
          {step > 1 && (
            <button type="button" className="text-link" onClick={back}>
              <Icon name="arrow" className="icon-back" />
              {labels.back}
            </button>
          )}
        </div>
        {isLast ? (
          <Button disabled={submitState === 'sending'} onClick={submit}>
            {submitState === 'sending' ? copy(locale).sending : labels.submit}
          </Button>
        ) : (
          <Button onClick={next}>
            {labels.next}
            <Icon name="arrow" />
          </Button>
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
      website: typeof data.get('website') === 'string' ? (data.get('website') as string) : '',
      ...mapUtm(utm),
    };
    const body =
      kind === 'consultation'
        ? {
            ...base,
            companyStage: data.get('companyStage') || undefined,
            timeline: data.get('timeline') || undefined,
          }
        : base;
    try {
      const endpoint =
        kind === 'consultation'
          ? '/api/v1/public/forms/consultation'
          : '/api/v1/public/forms/contact';
      const { error } = await apiClient.POST(endpoint as '/api/v1/public/forms/contact', {
        params: { header: { 'Idempotency-Key': crypto.randomUUID() } },
        body: body as never,
      });
      if (error) {
        const message = (error as { detail?: string }).detail ?? 'Submission failed';
        throw new Error(message);
      }
      setState('success');
      track(`${kind}_submit`, { locale });
      event.currentTarget.reset();
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
            <Field label={locale.startsWith('ar') ? 'مرحلة الشركة' : 'Company stage'}>
              <Input name="companyStage" maxLength={120} />
            </Field>
            <Field label={locale.startsWith('ar') ? 'المدة المتوقعة' : 'Timeline'}>
              <Input name="timeline" maxLength={120} />
            </Field>
          </>
        )}
      </div>
      <Field label={locale.startsWith('ar') ? 'الرسالة' : 'Message'}>
        <Textarea name="message" required minLength={10} maxLength={5000} />
      </Field>
      <Checkbox name="consent" required label={t.privacy} />
      <Button disabled={state === 'sending'} type="submit">
        {state === 'sending' ? t.sending : t.submit}
      </Button>
      {state === 'success' && (
        <div className="form-status form-status--success" role="status">
          {t.success}
        </div>
      )}
      {state === 'error' && (
        <div className="form-status form-status--error" role="alert">
          {t.error}
        </div>
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
