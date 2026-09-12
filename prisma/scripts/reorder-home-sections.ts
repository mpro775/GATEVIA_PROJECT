/**
 * prisma/scripts/reorder-home-sections.ts
 *
 * Safe two-phase data-correction script for the canonical home page section order.
 *
 * Canonical target order:
 *   hero            10
 *   process         20
 *   timeline        30
 *   services_grid   40
 *   industries_grid 50
 *   stats           60
 *   case_studies    70
 *   testimonials    80
 *   logo_cloud      90
 *   ecosystem       100
 *   insights        110
 *   faq             120
 *   cta             130
 *
 * Requirements:
 *  - Idempotent: safe to run multiple times.
 *  - Two-phase transaction: avoids @@unique(pageId, sortOrder) collision.
 *  - Leaves unknown/custom sections untouched unless they conflict.
 *  - Prints before/after order.
 *  - Fails clearly if managed section types are ambiguous (duplicates).
 *  - Does NOT silently delete sections.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CANONICAL: Record<string, number> = {
  hero: 10,
  process: 20,
  timeline: 30,
  services_grid: 40,
  industries_grid: 50,
  stats: 60,
  case_studies: 70,
  testimonials: 80,
  logo_cloud: 90,
  ecosystem: 100,
  insights: 110,
  faq: 120,
  cta: 130,
};

const TEMP_BASE = 1010;

async function main() {
  const homeTranslation = await prisma.pageTranslation.findFirst({
    where: { locale: 'en', slug: 'home' },
    select: { pageId: true },
  });

  if (!homeTranslation) {
    throw new Error('Home page not found. Ensure content seed has run first.');
  }
  const pageId = homeTranslation.pageId;

  const sections = await prisma.pageSection.findMany({
    where: { pageId },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, sectionType: true, sortOrder: true },
  });

  console.log('\n-- Before reorder ---');
  for (const s of sections) {
    console.log(`  ${String(s.sortOrder).padStart(4)} ${s.sectionType}`);
  }

  const managed = sections.filter((s) => s.sectionType in CANONICAL);
  const unmanaged = sections.filter((s) => !(s.sectionType in CANONICAL));

  const seenTypes = new Map();
  for (const s of managed) {
    const existing = seenTypes.get(s.sectionType) ?? [];
    existing.push(s.id);
    seenTypes.set(s.sectionType, existing);
  }
  const duplicates = [...seenTypes.entries()].filter(([, ids]) => ids.length > 1);
  if (duplicates.length > 0) {
    console.error('\nDuplicate managed section types found:');
    for (const [type, ids] of duplicates) {
      console.error(`   ${type}: ${ids.join(', ')}`);
    }
    throw new Error('Duplicate managed section types. Resolve manually before reordering.');
  }

  const alreadyCorrect = managed.every((s) => s.sortOrder === CANONICAL[s.sectionType]);
  if (alreadyCorrect) {
    console.log('\nHome section order is already canonical. Nothing to change.');
    return;
  }

  const canonicalOrders = new Set(Object.values(CANONICAL));
  const conflictingUnmanaged = unmanaged.filter((s) => canonicalOrders.has(s.sortOrder));
  if (conflictingUnmanaged.length > 0) {
    console.error('\nUnmanaged sections conflict with canonical target sort orders:');
    for (const s of conflictingUnmanaged) {
      console.error(`   sortOrder=${s.sortOrder} type=${s.sectionType} id=${s.id}`);
    }
    throw new Error('Resolve unmanaged section conflicts before running this script.');
  }

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < managed.length; i++) {
      const section = managed[i];
      await tx.pageSection.update({
        where: { id: section.id },
        data: { sortOrder: TEMP_BASE + i },
      });
    }
    for (const section of managed) {
      const target = CANONICAL[section.sectionType];
      await tx.pageSection.update({
        where: { id: section.id },
        data: { sortOrder: target },
      });
    }
  });

  const finalSections = await prisma.pageSection.findMany({
    where: { pageId },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, sectionType: true, sortOrder: true },
  });

  console.log('\n-- After reorder ---');
  let allCorrect = true;
  for (const s of finalSections) {
    const expected = CANONICAL[s.sectionType];
    const status = expected === undefined ? '(custom)' : s.sortOrder === expected ? 'OK' : 'WRONG';
    console.log(`  ${String(s.sortOrder).padStart(4)} ${s.sectionType} ${status}`);
    if (expected !== undefined && s.sortOrder !== expected) allCorrect = false;
  }

  if (!allCorrect) {
    throw new Error('Not all managed sections reached canonical sort order.');
  }

  console.log('\nHome section order corrected successfully.');
}

main()
  .catch((error) => {
    console.error('Error:', error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
