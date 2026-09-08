import type { OpenAPIObject, SchemaObject } from '@nestjs/swagger';

type Schema = SchemaObject | { $ref: string };
const ref = (name: string): Schema => ({ $ref: `#/components/schemas/${name}` });
const arrayOf = (schema: Schema): SchemaObject => ({ type: 'array', items: schema });
const objectOf = (schema: Schema): SchemaObject => ({
  type: 'object',
  additionalProperties: schema,
});
const nullable = (schema: Schema): SchemaObject => ({ oneOf: [schema, { type: 'null' }] });
const envelope = (data: Schema): SchemaObject => ({
  type: 'object',
  required: ['data'],
  properties: { data },
});
const paginated = (item: Schema): SchemaObject => ({
  type: 'object',
  required: ['data', 'meta'],
  properties: { data: arrayOf(item), meta: ref('PaginationMeta') },
});

const schemas: Record<string, SchemaObject> = {
  JsonObject: { type: 'object', additionalProperties: true },
  PaginationMeta: {
    type: 'object',
    required: ['page', 'pageSize', 'total', 'pageCount'],
    properties: {
      page: { type: 'integer', minimum: 1 },
      pageSize: { type: 'integer', minimum: 1 },
      total: { type: 'integer', minimum: 0 },
      pageCount: { type: 'integer', minimum: 0 },
    },
  },
  ProblemDetails: {
    type: 'object',
    required: ['type', 'title', 'status', 'detail'],
    properties: {
      type: { type: 'string' },
      title: { type: 'string' },
      status: { type: 'integer' },
      detail: { type: 'string' },
      instance: { type: 'string' },
      requestId: { type: 'string' },
      errors: { type: 'object', additionalProperties: arrayOf({ type: 'string' }) },
    },
  },
  Language: {
    type: 'object',
    required: [
      'id',
      'code',
      'name',
      'nativeName',
      'direction',
      'isActive',
      'isDefault',
      'sortOrder',
    ],
    properties: {
      id: { type: 'string', format: 'uuid' },
      code: { type: 'string' },
      name: { type: 'string' },
      nativeName: { type: 'string' },
      direction: { type: 'string', enum: ['ltr', 'rtl'] },
      isActive: { type: 'boolean' },
      isDefault: { type: 'boolean' },
      sortOrder: { type: 'integer' },
    },
  },
  AuthUser: {
    type: 'object',
    required: ['id', 'email', 'displayName', 'permissions'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      displayName: { type: 'string' },
      permissions: arrayOf({ type: 'string' }),
    },
  },
  Permission: {
    type: 'object',
    required: ['id', 'key'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      key: { type: 'string' },
      description: { type: 'string' },
    },
  },
  Role: {
    type: 'object',
    required: ['id', 'key', 'name', 'isSystem'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      key: { type: 'string' },
      name: { type: 'string' },
      isSystem: { type: 'boolean' },
      permissions: arrayOf({ type: 'object', properties: { permission: ref('Permission') } }),
      _count: { type: 'object', properties: { users: { type: 'integer' } } },
    },
  },
  User: {
    type: 'object',
    required: ['id', 'email', 'displayName', 'status'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      displayName: { type: 'string' },
      status: { type: 'string', enum: ['active', 'suspended', 'invited'] },
      lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      roles: arrayOf({
        oneOf: [ref('Role'), { type: 'object', properties: { role: ref('Role') } }],
      }),
    },
  },
  MediaTranslation: {
    type: 'object',
    required: ['locale'],
    properties: {
      locale: { type: 'string' },
      title: { type: 'string' },
      altText: { type: 'string' },
      caption: { type: 'string' },
      decorative: { type: 'boolean' },
    },
  },
  MediaVariant: {
    type: 'object',
    required: ['variantKey'],
    properties: {
      variantKey: { type: 'string' },
      key: { type: 'string' },
      url: { type: 'string', format: 'uri' },
      width: { type: 'integer' },
      height: { type: 'integer' },
    },
  },
  MediaFolder: {
    type: 'object',
    required: ['id', 'name'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      parentId: nullable({ type: 'string', format: 'uuid' }),
    },
  },
  Media: {
    type: 'object',
    required: ['id', 'originalFilename', 'mimeType', 'status', 'sizeBytes'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      originalFilename: { type: 'string' },
      mimeType: { type: 'string' },
      status: { type: 'string', enum: ['pending', 'processing', 'ready', 'failed', 'archived'] },
      sizeBytes: { oneOf: [{ type: 'integer' }, { type: 'string' }] },
      url: { type: 'string', format: 'uri' },
      folderId: nullable({ type: 'string', format: 'uuid' }),
      folder: nullable(ref('MediaFolder')),
      translations: arrayOf(ref('MediaTranslation')),
      variants: arrayOf(ref('MediaVariant')),
      createdAt: { type: 'string', format: 'date-time' },
      uploadedById: { type: 'string', format: 'uuid' },
    },
  },
  MediaUsage: {
    type: 'object',
    required: ['type', 'id'],
    properties: { type: { type: 'string' }, id: { type: 'string' }, label: { type: 'string' } },
  },
  UploadSession: {
    type: 'object',
    required: ['url', 'headers', 'uploadToken'],
    properties: {
      url: { type: 'string', format: 'uri' },
      headers: objectOf({ type: 'string' }),
      uploadToken: { type: 'string' },
    },
  },
  NavigationItem: {
    type: 'object',
    required: ['id', 'label', 'external'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      label: { type: 'string' },
      href: nullable({ type: 'string' }),
      external: { type: 'boolean' },
      children: arrayOf(ref('NavigationItem')),
    },
  },
  NavigationMenu: {
    type: 'object',
    required: ['key', 'items'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      key: { type: 'string' },
      location: { type: 'string' },
      status: { type: 'string', enum: ['draft', 'review', 'published', 'archived'] },
      items: arrayOf(ref('NavigationItem')),
    },
  },
  PublicSettings: {
    type: 'object',
    required: ['values', 'media'],
    properties: { values: objectOf({}), media: objectOf(ref('Media')) },
  },
  Setting: {
    type: 'object',
    required: ['id', 'key', 'value', 'category', 'isPublic'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      key: { type: 'string' },
      value: {},
      category: { type: 'string' },
      isPublic: { type: 'boolean' },
      description: { type: 'string' },
    },
  },
  Redirect: {
    type: 'object',
    required: ['id', 'sourcePath', 'destinationPath', 'statusCode', 'active'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      sourcePath: { type: 'string' },
      destinationPath: { type: 'string' },
      statusCode: { type: 'integer', enum: [301, 302, 307, 308] },
      active: { type: 'boolean' },
      locale: { type: 'string' },
    },
  },
  RedirectMatch: {
    type: 'object',
    required: ['destinationPath', 'statusCode'],
    properties: {
      destinationPath: { type: 'string' },
      statusCode: { type: 'integer', enum: [301, 302, 307, 308] },
    },
  },
  SubmissionReceipt: {
    type: 'object',
    required: ['id', 'duplicate'],
    properties: { id: { type: 'string', format: 'uuid' }, duplicate: { type: 'boolean' } },
  },
  ContentRecord: {
    type: 'object',
    additionalProperties: true,
    properties: {
      id: { type: 'string', format: 'uuid' },
      status: { type: 'string' },
      translations: arrayOf(ref('JsonObject')),
    },
  },
  Lead: {
    type: 'object',
    additionalProperties: true,
    required: ['id', 'status', 'source'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      status: {
        type: 'string',
        enum: ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'],
      },
      source: {
        type: 'string',
        enum: ['contact', 'consultation', 'assessment', 'landing_page', 'manual'],
      },
      assignedTo: nullable(ref('User')),
      activities: arrayOf(ref('JsonObject')),
      notes: arrayOf(ref('JsonObject')),
      assessments: arrayOf(ref('JsonObject')),
    },
  },
};

const responseContracts: Record<string, Schema> = {
  'GET /api/v1/auth/me': envelope(ref('AuthUser')),
  'POST /api/v1/public/forms/contact': envelope(ref('SubmissionReceipt')),
  'POST /api/v1/public/forms/consultation': envelope(ref('SubmissionReceipt')),
  'POST /api/v1/public/forms/market-entry-assessment': envelope(ref('SubmissionReceipt')),
  'GET /api/v1/admin/leads': paginated(ref('Lead')),
  'GET /api/v1/admin/leads/{id}': envelope(ref('Lead')),
  'PATCH /api/v1/admin/leads/{id}/status': envelope(ref('Lead')),
  'PATCH /api/v1/admin/leads/{id}/assignee': envelope(ref('Lead')),
  'GET /api/v1/admin/languages': envelope(arrayOf(ref('Language'))),
  'POST /api/v1/admin/languages': envelope(ref('Language')),
  'PATCH /api/v1/admin/languages/{id}': envelope(ref('Language')),
  'POST /api/v1/admin/languages/{id}/activate': envelope(ref('Language')),
  'POST /api/v1/admin/languages/{id}/deactivate': envelope(ref('Language')),
  'POST /api/v1/admin/languages/{id}/set-default': envelope(ref('Language')),
  'GET /api/v1/admin/media': paginated(ref('Media')),
  'POST /api/v1/admin/media/upload-session': envelope(ref('UploadSession')),
  'POST /api/v1/admin/media/{id}/replace-session': envelope(ref('UploadSession')),
  'POST /api/v1/admin/media/finalize': envelope(ref('Media')),
  'PATCH /api/v1/admin/media/{id}': envelope(ref('Media')),
  'GET /api/v1/admin/media/{id}/usages': envelope(arrayOf(ref('MediaUsage'))),
  'POST /api/v1/admin/media/{id}/archive': envelope(ref('Media')),
  'POST /api/v1/admin/media/{id}/retry': envelope(ref('Media')),
  'GET /api/v1/admin/media-folders': envelope(arrayOf(ref('MediaFolder'))),
  'POST /api/v1/admin/media-folders': envelope(ref('MediaFolder')),
  'PATCH /api/v1/admin/media-folders/{id}': envelope(ref('MediaFolder')),
  'GET /api/v1/admin/users': paginated(ref('User')),
  'POST /api/v1/admin/users': envelope(ref('User')),
  'GET /api/v1/admin/users/{id}': envelope(ref('User')),
  'PATCH /api/v1/admin/users/{id}': envelope(ref('User')),
  'GET /api/v1/admin/roles': envelope(arrayOf(ref('Role'))),
  'POST /api/v1/admin/roles': envelope(ref('Role')),
  'PATCH /api/v1/admin/roles/{id}': envelope(ref('Role')),
  'GET /api/v1/admin/permissions': envelope(arrayOf(ref('Permission'))),
  'GET /api/v1/admin/{resource}': paginated(ref('ContentRecord')),
  'POST /api/v1/admin/{resource}': envelope(ref('ContentRecord')),
  'GET /api/v1/admin/{resource}/{id}': envelope(ref('ContentRecord')),
  'PATCH /api/v1/admin/{resource}/{id}': envelope(ref('ContentRecord')),
  'POST /api/v1/admin/{resource}/{id}/publish': envelope(ref('ContentRecord')),
  'POST /api/v1/admin/{resource}/{id}/unpublish': envelope(ref('ContentRecord')),
  'POST /api/v1/admin/{resource}/{id}/archive': envelope(ref('ContentRecord')),
  'GET /api/v1/public/languages': envelope(arrayOf(ref('Language'))),
  'GET /api/v1/public/settings': envelope(ref('PublicSettings')),
  'GET /api/v1/public/navigation/{key}': envelope(ref('NavigationMenu')),
  'GET /api/v1/public/redirect': envelope(nullable(ref('RedirectMatch'))),
  'GET /api/v1/public/{resource}': envelope(arrayOf(ref('ContentRecord'))),
  'GET /api/v1/public/{resource}/{slug}': envelope(ref('ContentRecord')),
};

/** Adds explicit transport schemas for endpoints whose handlers return anonymous objects. */
export function applyOpenApiContracts(document: OpenAPIObject): OpenAPIObject {
  document.components = {
    ...document.components,
    schemas: { ...document.components?.schemas, ...schemas },
  };
  for (const [contract, schema] of Object.entries(responseContracts)) {
    const [method, path] = contract.split(' ') as [string, string];
    const operation = document.paths[path]?.[method.toLowerCase() as 'get' | 'post' | 'patch'];
    if (!operation) continue;
    operation.responses[method === 'POST' ? '201' : '200'] = {
      description: 'Successful response',
      content: { 'application/json': { schema } },
    };
    operation.responses.default = {
      description: 'Problem Details error response',
      content: { 'application/problem+json': { schema: ref('ProblemDetails') } },
    };
  }
  return document;
}
