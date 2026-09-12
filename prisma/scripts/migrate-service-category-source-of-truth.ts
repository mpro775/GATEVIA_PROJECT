import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');
const dryRun = process.argv.includes('--dry-run') || !apply;

if (apply && process.argv.includes('--dry-run')) {
  throw new Error('Choose either --dry-run or --apply, not both.');
}

const slugs = ['market-access', 'execution', 'growth'] as const;
type Slug = (typeof slugs)[number];
type JsonObject = Record<string, unknown>;

const seedLegacyBodies: Record<string, Record<Slug, string[]>> = {
  en: {
    'market-access': [
      'Understand the market, validate the opportunity and define the right entry direction.',
      'Research, feasibility, competition and entry strategy.',
    ],
    execution: [
      'Coordinate establishment, licensing, sourcing and local operational readiness.',
      'Formation, licensing, sourcing and operational setup support.',
    ],
    growth: [
      'Build go-to-market, partnerships, distribution and expansion priorities.',
      'Go-to-market, business development, partnerships and expansion.',
    ],
  },
  'ar-SA': {
    'market-access': [
      'فهم السوق والتحقق من الفرصة وتحديد اتجاه الدخول المناسب.',
      'البحث والجدوى والمنافسة واستراتيجية الدخول.',
    ],
    execution: [
      'تنسيق التأسيس والتراخيص والتوريد والجاهزية التشغيلية المحلية.',
      'دعم التأسيس والتراخيص والتوريد والإعداد التشغيلي.',
    ],
    growth: [
      'بناء استراتيجية الذهاب إلى السوق والشراكات والتوزيع وأولويات التوسع.',
      'الذهاب إلى السوق وتطوير الأعمال والشراكات والتوسع.',
    ],
  },
};

function object(value: Prisma.JsonValue): JsonObject {
  return value && !Array.isArray(value) && typeof value === 'object' ? value : {};
}

function steps(content: JsonObject): JsonObject[] {
  return Array.isArray(content.steps)
    ? content.steps.filter(
        (value): value is JsonObject => Boolean(value) && typeof value === 'object' && !Array.isArray(value),
      )
    : [];
}

async function canonicalCategories() {
  const rows = await prisma.serviceCategory.findMany({
    where: { translations: { some: { locale: 'en', slug: { in: [...slugs] } } } },
    include: { translations: true },
  });
  const bySlug = new Map<Slug, (typeof rows)[number]>();
  for (const slug of slugs) {
    const matches = rows.filter((row) =>
      row.translations.some((translation) => translation.locale === 'en' && translation.slug === slug),
    );
    if (matches.length !== 1)
      throw new Error(`Expected exactly one canonical category for English slug "${slug}"; found ${matches.length}.`);
    bySlug.set(slug, matches[0]!);
  }
  return bySlug;
}

async function semanticPage(pageType: string, templateKey: string) {
  const pages = await prisma.page.findMany({
    where: { pageType, templateKey },
    include: {
      sections: {
        include: { translations: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
  if (pages.length !== 1)
    throw new Error(`Expected exactly one ${templateKey} page; found ${pages.length}.`);
  return pages[0]!;
}

function categorySlugForTitle(
  title: unknown,
  locale: string,
  categories: Awaited<ReturnType<typeof canonicalCategories>>,
) {
  const matches = slugs.filter((slug) => {
    const category = categories.get(slug)!;
    return category.translations.some(
      (translation) => translation.locale === locale && translation.name === title,
    );
  });
  return matches.length === 1 ? matches[0] : undefined;
}

function legacyCandidates(
  page: Awaited<ReturnType<typeof semanticPage>>,
  categories: Awaited<ReturnType<typeof canonicalCategories>>,
) {
  return page.sections.filter((section) => {
    if (section.sectionType !== 'process') return false;
    return section.translations.some((translation) => {
      const content = object(translation.content);
      const items = steps(content);
      if (items.length !== 3) return false;
      const matched = items.map((step) => categorySlugForTitle(step.title, translation.locale, categories));
      return matched.every(Boolean) && new Set(matched).size === 3;
    });
  });
}

function findSection(
  page: Awaited<ReturnType<typeof semanticPage>>,
  categories: Awaited<ReturnType<typeof canonicalCategories>>,
  label: string,
) {
  const converted = page.sections.filter((section) => section.sectionType === 'service_category_pillars');
  if (converted.length > 1) throw new Error(`${label} has multiple service_category_pillars sections.`);
  if (converted.length === 1) return { section: converted[0]!, converted: true };
  const candidates = legacyCandidates(page, categories);
  if (candidates.length !== 1) {
    console.error(`${label} legacy candidates:`, candidates.map((section) => ({ id: section.id, sortOrder: section.sortOrder })));
    throw new Error(`Expected one unambiguous legacy ${label} capability section; found ${candidates.length}.`);
  }
  return { section: candidates[0]!, converted: false };
}

async function main() {
  console.info(`Mode: ${dryRun ? 'DRY RUN' : 'APPLY'}`);
  const categories = await canonicalCategories();
  const home = await semanticPage('home', 'home');
  const about = await semanticPage('standard', 'about');
  const homeMatch = findSection(home, categories, 'Home');
  const aboutMatch = findSection(about, categories, 'About');
  const categoryIds = slugs.map((slug) => categories.get(slug)!.id);
  const coverUpdates = new Map<string, string>();
  const authoredConflicts: string[] = [];

  console.info(`Home section: ${homeMatch.section.id} (${homeMatch.converted ? 'already converted' : 'legacy detected'})`);
  console.info(`About section: ${aboutMatch.section.id} (${aboutMatch.converted ? 'already converted' : 'legacy detected'})`);

  if (!homeMatch.converted) {
    for (const translation of homeMatch.section.translations) {
      const content = object(translation.content);
      for (const step of steps(content)) {
        const slug = categorySlugForTitle(step.title, translation.locale, categories);
        if (!slug) throw new Error(`Cannot map Home step "${String(step.title)}" (${translation.locale}).`);
        const category = categories.get(slug)!;
        const categoryTranslation = category.translations.find((item) => item.locale === translation.locale);
        console.info(
          `[${translation.locale}] ${String(step.title)} <-> ${categoryTranslation?.name ?? '(missing)'} | ${String(step.body ?? '')} <-> ${categoryTranslation?.description ?? '(missing)'} | ${String(step.mediaId ?? '(none)')} <-> ${category.coverMediaId ?? '(none)'}`,
        );
        const body = String(step.body ?? '');
        if (
          body &&
          body !== categoryTranslation?.description &&
          !seedLegacyBodies[translation.locale]?.[slug]?.includes(body)
        ) {
          authoredConflicts.push(`${translation.locale}/${slug}: legacy body differs from canonical category description`);
        }
        if (typeof step.mediaId === 'string') {
          const previous = coverUpdates.get(category.id);
          if (previous && previous !== step.mediaId)
            throw new Error(`Conflicting Home media IDs across locales for ${slug}: ${previous} vs ${step.mediaId}.`);
          coverUpdates.set(category.id, step.mediaId);
        }
      }
    }
  }

  if (!aboutMatch.converted) {
    for (const translation of aboutMatch.section.translations) {
      for (const step of steps(object(translation.content))) {
        const slug = categorySlugForTitle(step.title, translation.locale, categories);
        if (!slug) throw new Error(`Cannot map About step "${String(step.title)}" (${translation.locale}).`);
        const categoryTranslation = categories
          .get(slug)!
          .translations.find((item) => item.locale === translation.locale);
        console.info(
          `[About/${translation.locale}] ${String(step.title)} <-> ${categoryTranslation?.name ?? '(missing)'} | ${String(step.body ?? '')} <-> ${categoryTranslation?.description ?? '(missing)'}`,
        );
        const body = String(step.body ?? '');
        if (
          body &&
          body !== categoryTranslation?.description &&
          !seedLegacyBodies[translation.locale]?.[slug]?.includes(body)
        ) {
          authoredConflicts.push(`${translation.locale}/${slug}: About body differs from canonical category description`);
        }
      }
    }
  }

  if (authoredConflicts.length) {
    console.error('Authored text conflicts requiring explicit review:', authoredConflicts);
    throw new Error('Migration stopped to avoid discarding authored Home copy. Reconcile category descriptions first.');
  }

  const mediaIds = [...new Set(coverUpdates.values())];
  if (mediaIds.length) {
    const existingMedia = await prisma.media.findMany({ where: { id: { in: mediaIds } }, select: { id: true } });
    const found = new Set(existingMedia.map((item) => item.id));
    const missing = mediaIds.filter((id) => !found.has(id));
    if (missing.length) throw new Error(`Referenced Home media records do not exist: ${missing.join(', ')}`);
  }

  for (const slug of slugs) {
    const category = categories.get(slug)!;
    const incoming = coverUpdates.get(category.id);
    if (incoming && category.coverMediaId && category.coverMediaId !== incoming)
      throw new Error(`${slug} already has a different cover (${category.coverMediaId}); Home has ${incoming}.`);
    console.info(`${slug}: cover ${incoming ? `${incoming}${category.coverMediaId === incoming ? ' (already set)' : ' (transfer)'}` : '(unchanged)'}`);
  }

  const pendingSections = [homeMatch, aboutMatch].filter((match) => !match.converted);
  const currentCoverById = new Map(
    slugs.map((slug) => {
      const category = categories.get(slug)!;
      return [category.id, category.coverMediaId] as const;
    }),
  );
  const pendingCovers = [...coverUpdates.entries()].filter(
    ([categoryId, mediaId]) => currentCoverById.get(categoryId) !== mediaId,
  );
  console.info(`Pending changes: ${pendingSections.length} section(s), ${pendingCovers.length} cover(s).`);
  if (dryRun || (!pendingSections.length && !pendingCovers.length)) return;

  await prisma.$transaction(async (tx) => {
    for (const [categoryId, coverMediaId] of pendingCovers) {
      await tx.serviceCategory.update({ where: { id: categoryId }, data: { coverMediaId } });
    }
    for (const match of pendingSections) {
      for (const translation of match.section.translations) {
        const previous = object(translation.content);
        await tx.pageSectionTranslation.update({
          where: { id: translation.id },
          data: {
            content: {
              ...(typeof previous.eyebrow === 'string' ? { eyebrow: previous.eyebrow } : {}),
              ...(typeof previous.title === 'string' ? { title: previous.title } : {}),
              categoryIds,
            },
          },
        });
      }
      await tx.pageSection.update({
        where: { id: match.section.id },
        data: { sectionType: 'service_category_pillars' },
      });
    }
  });
  console.info('Migration applied successfully. Run --dry-run again to confirm zero pending changes.');
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
