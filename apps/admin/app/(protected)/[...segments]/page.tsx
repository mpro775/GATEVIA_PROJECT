import { DataTable } from '@/components/data-table';
import { ContentEditor } from '@/components/content-editor';
import { LeadDetail } from '@/components/lead-detail';
import { MediaLibrary } from '@/components/media-library';
import { UserEditor } from '@/components/user-editor';
import { RoleEditor } from '@/components/role-editor';
import { LanguageEditor } from '@/components/language-editor';
import { NavigationEditor } from '@/components/navigation-editor';
import { SettingsEditor } from '@/components/settings-editor';
import { RedirectEditor } from '@/components/redirect-editor';

// Map URL segment keys to API resource names.
const resourceMap: Record<string, string> = {
  pages: 'pages',
  services: 'services',
  'service-categories': 'service-categories',
  industries: 'industries',
  'case-studies': 'case-studies',
  insights: 'insights',
  faqs: 'faqs',
  'team-members': 'team-members',
  clients: 'clients',
  partners: 'partners',
  brands: 'brands',
  products: 'products',
  testimonials: 'testimonials',
  certifications: 'certifications',
  'trust-metrics': 'trust-metrics',
  navigation: 'navigation',
  settings: 'settings',
  redirects: 'redirects',
  languages: 'languages',
  users: 'users',
  roles: 'roles',
  'audit-logs': 'audit-logs',
  media: 'media',
  leads: 'leads',
  consultation: 'leads',
  assessments: 'leads',
};

// Resources that use the ContentEditor (domain-aware).
const CONTENT_MODULES = new Set(['content', 'trust']);

// Resources that use standalone specialized editors (no generic fallback).
type SpecialEditorKey = 'users' | 'roles' | 'languages' | 'navigation' | 'settings' | 'redirects';

const SPECIALIZED_LIST_ONLY = new Set<string>(['navigation', 'settings']);

export default async function Workspace({
  params,
}: {
  params: Promise<{ segments: string[] }>;
}) {
  const { segments } = await params;
  const module = segments[0] ?? '';
  const key = segments[1] ?? segments[0] ?? '';
  const id = segments[2] ?? (module === 'media' ? segments[1] : undefined);
  const resource = resourceMap[key] ?? key;
  const basePath = `/${segments.slice(0, id ? 2 : segments.length).join('/')}`;
  const isNew = id === 'new';
  const recordId = isNew ? undefined : id;

  // ── Media library ─────────────────────────────────────────────────────────
  if (resource === 'media' && !id) {
    return (
      <main className="admin-content">
        <MediaLibrary />
      </main>
    );
  }

  // ── Lead detail ───────────────────────────────────────────────────────────
  if (resource === 'leads' && recordId) {
    return (
      <main className="admin-content">
        <LeadDetail id={recordId} />
      </main>
    );
  }

  // ── Navigation builder (list + editor in one page) ────────────────────────
  if (resource === 'navigation') {
    return (
      <main className="admin-content">
        <NavigationEditor />
      </main>
    );
  }

  // ── Global Settings ───────────────────────────────────────────────────────
  if (resource === 'settings') {
    return (
      <main className="admin-content">
        <SettingsEditor />
      </main>
    );
  }

  // ── Users: list or editor ─────────────────────────────────────────────────
  if (module === 'system' && key === 'users') {
    if (isNew || recordId) {
      return (
        <main className="admin-content">
          <UserEditor id={recordId} returnPath={basePath} />
        </main>
      );
    }
    return (
      <main className="admin-content">
        <DataTable title="Users" resource="users" basePath={basePath} kind="user" />
      </main>
    );
  }

  // ── Roles: list or editor ─────────────────────────────────────────────────
  if (module === 'system' && key === 'roles') {
    if (isNew || recordId) {
      return (
        <main className="admin-content">
          <RoleEditor id={recordId} returnPath={basePath} />
        </main>
      );
    }
    return (
      <main className="admin-content">
        <DataTable title="Roles & Permissions" resource="roles" basePath={basePath} kind="role" />
      </main>
    );
  }

  // ── Languages: list or editor ─────────────────────────────────────────────
  if (module === 'website' && key === 'languages') {
    if (isNew || recordId) {
      return (
        <main className="admin-content">
          <LanguageEditor id={recordId} returnPath={basePath} />
        </main>
      );
    }
    return (
      <main className="admin-content">
        <DataTable title="Languages" resource="languages" basePath={basePath} kind="language" />
      </main>
    );
  }

  // ── Redirects: list or editor ─────────────────────────────────────────────
  if (module === 'website' && key === 'redirects') {
    if (isNew || recordId) {
      return (
        <main className="admin-content">
          <RedirectEditor id={recordId} returnPath={basePath} />
        </main>
      );
    }
    return (
      <main className="admin-content">
        <DataTable title="Redirects" resource="redirects" basePath={basePath} kind="content" />
      </main>
    );
  }

  // ── ContentEditor for CMS/Trust resources ─────────────────────────────────
  if (isNew || (recordId && CONTENT_MODULES.has(module))) {
    return (
      <main className="admin-content">
        <ContentEditor resource={resource} id={recordId} returnPath={basePath} />
      </main>
    );
  }

  // ── Generic DataTable fallback ────────────────────────────────────────────
  const title = key.replaceAll('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <main className="admin-content">
      <DataTable
        title={title}
        resource={resource}
        basePath={basePath}
        kind={
          resource === 'leads'
            ? 'lead'
            : resource === 'audit-logs'
              ? 'audit'
              : resource === 'languages'
                ? 'language'
                : resource === 'users'
                  ? 'user'
                  : resource === 'roles'
                    ? 'role'
                    : 'content'
        }
      />
    </main>
  );
}
