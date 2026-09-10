-- Authored completion of the extension-only baseline. Apply once after 20260908000100.
-- The baseline owns the required pgcrypto and citext extensions; this migration owns the schema DDL.
BEGIN;

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'invited');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('ltr', 'rtl');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('draft', 'review', 'published', 'archived');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('pending_upload', 'processing', 'ready', 'failed', 'archived');

-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('article', 'guide', 'report');

-- CreateEnum
CREATE TYPE "NavigationItemType" AS ENUM ('internal', 'external');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('contact', 'consultation', 'assessment', 'landing_page', 'manual');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'queued', 'sent', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" CITEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'invited',
    "must_change_password" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "csrf_token_hash" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_hash" TEXT,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(16) NOT NULL,
    "name" TEXT NOT NULL,
    "native_name" TEXT NOT NULL,
    "direction" "Direction" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "locale_format" TEXT,
    "date_locale" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_folders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "parent_id" UUID,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "media_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "folder_id" UUID,
    "storage_provider" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "normalized_filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "extension" TEXT,
    "size_bytes" BIGINT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration_seconds" DECIMAL(12,3),
    "checksum" TEXT,
    "status" "MediaStatus" NOT NULL DEFAULT 'pending_upload',
    "uploaded_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "media_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "title" TEXT,
    "alt_text" TEXT,
    "caption" TEXT,
    "decorative" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "media_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_variants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "media_id" UUID NOT NULL,
    "variant_key" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "page_type" TEXT NOT NULL,
    "template_key" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "page_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "og_title" TEXT,
    "og_description" TEXT,
    "og_media_id" UUID,
    "canonical_url" TEXT,
    "robots_index" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "page_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_sections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "page_id" UUID NOT NULL,
    "section_type" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_section_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "section_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "content" JSONB NOT NULL,

    CONSTRAINT "page_section_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "icon_media_id" UUID,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_category_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "service_category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_id" UUID NOT NULL,
    "hero_media_id" UUID,
    "icon_media_id" UUID,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "who_for" JSONB NOT NULL DEFAULT '[]',
    "problems" JSONB NOT NULL DEFAULT '[]',
    "deliverables" JSONB NOT NULL DEFAULT '[]',
    "process" JSONB NOT NULL DEFAULT '[]',
    "benefits" JSONB NOT NULL DEFAULT '[]',
    "timeline_text" TEXT,
    "cta_label" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "og_media_id" UUID,
    "og_title" TEXT,
    "og_description" TEXT,
    "canonical_url" TEXT,
    "robots_index" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "service_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hero_media_id" UUID,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "industries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "industry_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "challenges" JSONB NOT NULL DEFAULT '[]',
    "opportunities" JSONB NOT NULL DEFAULT '[]',
    "cta_label" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "og_media_id" UUID,
    "og_title" TEXT,
    "og_description" TEXT,
    "canonical_url" TEXT,
    "robots_index" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "industry_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_industries" (
    "service_id" UUID NOT NULL,
    "industry_id" UUID NOT NULL,

    CONSTRAINT "service_industries_pkey" PRIMARY KEY ("service_id","industry_id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "logo_media_id" UUID,
    "website" TEXT,
    "industry_id" UUID,
    "country_code" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "public_visibility" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "name" TEXT NOT NULL,
    "short_description" TEXT,

    CONSTRAINT "client_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_studies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_id" UUID,
    "anonymized" BOOLEAN NOT NULL DEFAULT false,
    "country_code" TEXT,
    "hero_media_id" UUID,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "case_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_study_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "case_study_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "client_label" TEXT,
    "context" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "objectives" JSONB NOT NULL DEFAULT '[]',
    "solution" TEXT NOT NULL,
    "process" JSONB NOT NULL DEFAULT '[]',
    "results" JSONB NOT NULL DEFAULT '[]',
    "metrics" JSONB NOT NULL DEFAULT '[]',
    "testimonial_text" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "og_media_id" UUID,
    "og_title" TEXT,
    "og_description" TEXT,
    "canonical_url" TEXT,
    "robots_index" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "case_study_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_study_services" (
    "case_study_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,

    CONSTRAINT "case_study_services_pkey" PRIMARY KEY ("case_study_id","service_id")
);

-- CreateTable
CREATE TABLE "case_study_industries" (
    "case_study_id" UUID NOT NULL,
    "industry_id" UUID NOT NULL,

    CONSTRAINT "case_study_industries_pkey" PRIMARY KEY ("case_study_id","industry_id")
);

-- CreateTable
CREATE TABLE "case_study_media" (
    "case_study_id" UUID NOT NULL,
    "media_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "case_study_media_pkey" PRIMARY KEY ("case_study_id","media_id")
);

-- CreateTable
CREATE TABLE "insight_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "insight_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insight_category_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "insight_category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insights" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "InsightType" NOT NULL,
    "category_id" UUID,
    "author_user_id" UUID,
    "cover_media_id" UUID,
    "downloadable_media_id" UUID,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insight_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "insight_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "og_media_id" UUID,
    "og_title" TEXT,
    "og_description" TEXT,
    "canonical_url" TEXT,
    "robots_index" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "insight_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tag_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "tag_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insight_tags" (
    "insight_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "insight_tags_pkey" PRIMARY KEY ("insight_id","tag_id")
);

-- CreateTable
CREATE TABLE "insight_services" (
    "insight_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,

    CONSTRAINT "insight_services_pkey" PRIMARY KEY ("insight_id","service_id")
);

-- CreateTable
CREATE TABLE "insight_industries" (
    "insight_id" UUID NOT NULL,
    "industry_id" UUID NOT NULL,

    CONSTRAINT "insight_industries_pkey" PRIMARY KEY ("insight_id","industry_id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_key" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "faq_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "faq_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_faqs" (
    "service_id" UUID NOT NULL,
    "faq_id" UUID NOT NULL,

    CONSTRAINT "service_faqs_pkey" PRIMARY KEY ("service_id","faq_id")
);

-- CreateTable
CREATE TABLE "page_faqs" (
    "page_id" UUID NOT NULL,
    "faq_id" UUID NOT NULL,

    CONSTRAINT "page_faqs_pkey" PRIMARY KEY ("page_id","faq_id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "photo_media_id" UUID,
    "linkedin_url" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_member_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "bio" TEXT NOT NULL,

    CONSTRAINT "team_member_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "partner_type" TEXT NOT NULL,
    "logo_media_id" UUID,
    "website" TEXT,
    "country_code" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "public_visibility" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "start_date" DATE,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "partner_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "partner_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "logo_media_id" UUID,
    "cover_media_id" UUID,
    "industry_id" UUID,
    "website" TEXT,
    "relationship_type" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "country_code" TEXT,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brand_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "full_description" TEXT NOT NULL,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "og_title" TEXT,
    "og_description" TEXT,
    "canonical_url" TEXT,
    "robots_index" BOOLEAN NOT NULL DEFAULT true,
    "og_media_id" UUID,

    CONSTRAINT "brand_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_ventures" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "logo_media_id" UUID,
    "product_type" TEXT NOT NULL,
    "industry_id" UUID,
    "website" TEXT,
    "launch_status" TEXT NOT NULL,
    "relationship_type" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "product_ventures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_venture_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_venture_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "full_description" TEXT NOT NULL,
    "key_features" JSONB NOT NULL DEFAULT '[]',
    "seo_title" TEXT,
    "seo_description" TEXT,
    "og_title" TEXT,
    "og_description" TEXT,
    "canonical_url" TEXT,
    "robots_index" BOOLEAN NOT NULL DEFAULT true,
    "og_media_id" UUID,

    CONSTRAINT "product_venture_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_id" UUID,
    "logo_media_id" UUID,
    "person_name" TEXT NOT NULL,
    "person_role" TEXT,
    "company_name" TEXT,
    "country_code" TEXT,
    "consent_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "case_study_id" UUID,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonial_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "testimonial_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "quote" TEXT NOT NULL,

    CONSTRAINT "testimonial_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "logo_media_id" UUID,
    "issuer" TEXT NOT NULL,
    "certificate_number" TEXT,
    "valid_from" DATE,
    "valid_until" DATE,
    "verification_url" TEXT,
    "public_visibility" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "certification_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "certification_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "value" TEXT NOT NULL,
    "suffix" TEXT,
    "evidence_note_internal" TEXT,
    "public_visibility" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "trust_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_metric_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "trust_metric_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "trust_metric_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navigation_menus" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "navigation_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navigation_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "menu_id" UUID NOT NULL,
    "parent_id" UUID,
    "item_type" "NavigationItemType" NOT NULL,
    "internal_entity_type" TEXT,
    "internal_entity_id" UUID,
    "external_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "navigation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navigation_item_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "navigation_item_id" UUID NOT NULL,
    "locale" VARCHAR(16) NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "navigation_item_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "updated_by" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "global_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redirects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "source_path" TEXT NOT NULL,
    "destination_path" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL,
    "locale" VARCHAR(16),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "redirects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "full_name" TEXT NOT NULL,
    "company_name" TEXT,
    "email" CITEXT NOT NULL,
    "phone" TEXT,
    "country_code" TEXT,
    "preferred_locale" TEXT,
    "industry_id" UUID,
    "service_id" UUID,
    "message" TEXT,
    "source_type" "LeadSource" NOT NULL,
    "source_page" TEXT,
    "source_url" TEXT,
    "submission_locale" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'new',
    "assigned_to_user_id" UUID,
    "duplicate_of_id" UUID,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_term" TEXT,
    "utm_content" TEXT,
    "referrer" TEXT,
    "landing_page" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "consent_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "consent_at" TIMESTAMPTZ(6),
    "form_details" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lead_id" UUID NOT NULL,
    "author_user_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "lead_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lead_id" UUID NOT NULL,
    "actor_user_id" UUID,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lead_id" UUID NOT NULL,
    "form_version" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "submitted_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "request_hash" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_user_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "summary" JSONB,
    "request_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_message_id" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'pending',
    "error_code" TEXT,
    "related_entity_type" TEXT,
    "related_entity_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_venture_media" (
    "product_venture_id" UUID NOT NULL,
    "media_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_venture_media_pkey" PRIMARY KEY ("product_venture_id","media_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_key_key" ON "roles"("key");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE INDEX "auth_sessions_user_id_expires_at_idx" ON "auth_sessions"("user_id", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_expires_at_idx" ON "password_reset_tokens"("user_id", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE INDEX "languages_is_active_sort_order_idx" ON "languages"("is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "media_folders_parent_id_name_key" ON "media_folders"("parent_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "media_storage_key_key" ON "media"("storage_key");

-- CreateIndex
CREATE INDEX "media_status_created_at_idx" ON "media"("status", "created_at");

-- CreateIndex
CREATE INDEX "media_folder_id_created_at_idx" ON "media"("folder_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "media_translations_media_id_locale_key" ON "media_translations"("media_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "media_variants_storage_key_key" ON "media_variants"("storage_key");

-- CreateIndex
CREATE UNIQUE INDEX "media_variants_media_id_variant_key_mime_type_key" ON "media_variants"("media_id", "variant_key", "mime_type");

-- CreateIndex
CREATE INDEX "pages_status_published_at_idx" ON "pages"("status", "published_at");

-- CreateIndex
CREATE INDEX "page_translations_og_media_id_idx" ON "page_translations"("og_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "page_translations_page_id_locale_key" ON "page_translations"("page_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "page_translations_locale_slug_key" ON "page_translations"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "page_sections_page_id_sort_order_key" ON "page_sections"("page_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "page_section_translations_section_id_locale_key" ON "page_section_translations"("section_id", "locale");

-- CreateIndex
CREATE INDEX "service_categories_status_sort_order_idx" ON "service_categories"("status", "sort_order");

-- CreateIndex
CREATE INDEX "service_categories_icon_media_id_idx" ON "service_categories"("icon_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_category_translations_category_id_locale_key" ON "service_category_translations"("category_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "service_category_translations_locale_slug_key" ON "service_category_translations"("locale", "slug");

-- CreateIndex
CREATE INDEX "services_status_featured_sort_order_idx" ON "services"("status", "featured", "sort_order");

-- CreateIndex
CREATE INDEX "services_hero_media_id_idx" ON "services"("hero_media_id");

-- CreateIndex
CREATE INDEX "services_icon_media_id_idx" ON "services"("icon_media_id");

-- CreateIndex
CREATE INDEX "service_translations_og_media_id_idx" ON "service_translations"("og_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_translations_service_id_locale_key" ON "service_translations"("service_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "service_translations_locale_slug_key" ON "service_translations"("locale", "slug");

-- CreateIndex
CREATE INDEX "industries_status_featured_sort_order_idx" ON "industries"("status", "featured", "sort_order");

-- CreateIndex
CREATE INDEX "industries_hero_media_id_idx" ON "industries"("hero_media_id");

-- CreateIndex
CREATE INDEX "industry_translations_og_media_id_idx" ON "industry_translations"("og_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "industry_translations_industry_id_locale_key" ON "industry_translations"("industry_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "industry_translations_locale_slug_key" ON "industry_translations"("locale", "slug");

-- CreateIndex
CREATE INDEX "clients_status_public_visibility_sort_order_idx" ON "clients"("status", "public_visibility", "sort_order");

-- CreateIndex
CREATE INDEX "clients_logo_media_id_idx" ON "clients"("logo_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_translations_client_id_locale_key" ON "client_translations"("client_id", "locale");

-- CreateIndex
CREATE INDEX "case_studies_status_featured_published_at_idx" ON "case_studies"("status", "featured", "published_at");

-- CreateIndex
CREATE INDEX "case_studies_hero_media_id_idx" ON "case_studies"("hero_media_id");

-- CreateIndex
CREATE INDEX "case_study_translations_og_media_id_idx" ON "case_study_translations"("og_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "case_study_translations_case_study_id_locale_key" ON "case_study_translations"("case_study_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "case_study_translations_locale_slug_key" ON "case_study_translations"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "insight_category_translations_category_id_locale_key" ON "insight_category_translations"("category_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "insight_category_translations_locale_slug_key" ON "insight_category_translations"("locale", "slug");

-- CreateIndex
CREATE INDEX "insights_status_type_published_at_idx" ON "insights"("status", "type", "published_at");

-- CreateIndex
CREATE INDEX "insights_cover_media_id_idx" ON "insights"("cover_media_id");

-- CreateIndex
CREATE INDEX "insights_downloadable_media_id_idx" ON "insights"("downloadable_media_id");

-- CreateIndex
CREATE INDEX "insight_translations_og_media_id_idx" ON "insight_translations"("og_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "insight_translations_insight_id_locale_key" ON "insight_translations"("insight_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "insight_translations_locale_slug_key" ON "insight_translations"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_key_key" ON "tags"("key");

-- CreateIndex
CREATE UNIQUE INDEX "tag_translations_tag_id_locale_key" ON "tag_translations"("tag_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "tag_translations_locale_slug_key" ON "tag_translations"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "faq_translations_faq_id_locale_key" ON "faq_translations"("faq_id", "locale");

-- CreateIndex
CREATE INDEX "team_members_photo_media_id_idx" ON "team_members"("photo_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_member_translations_member_id_locale_key" ON "team_member_translations"("member_id", "locale");

-- CreateIndex
CREATE INDEX "partners_logo_media_id_idx" ON "partners"("logo_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_translations_partner_id_locale_key" ON "partner_translations"("partner_id", "locale");

-- CreateIndex
CREATE INDEX "brands_logo_media_id_idx" ON "brands"("logo_media_id");

-- CreateIndex
CREATE INDEX "brands_cover_media_id_idx" ON "brands"("cover_media_id");

-- CreateIndex
CREATE INDEX "brand_translations_og_media_id_idx" ON "brand_translations"("og_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "brand_translations_brand_id_locale_key" ON "brand_translations"("brand_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "brand_translations_locale_slug_key" ON "brand_translations"("locale", "slug");

-- CreateIndex
CREATE INDEX "product_ventures_logo_media_id_idx" ON "product_ventures"("logo_media_id");

-- CreateIndex
CREATE INDEX "product_venture_translations_og_media_id_idx" ON "product_venture_translations"("og_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_venture_translations_product_venture_id_locale_key" ON "product_venture_translations"("product_venture_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "product_venture_translations_locale_slug_key" ON "product_venture_translations"("locale", "slug");

-- CreateIndex
CREATE INDEX "testimonials_logo_media_id_idx" ON "testimonials"("logo_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "testimonial_translations_testimonial_id_locale_key" ON "testimonial_translations"("testimonial_id", "locale");

-- CreateIndex
CREATE INDEX "certifications_logo_media_id_idx" ON "certifications"("logo_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "certification_translations_certification_id_locale_key" ON "certification_translations"("certification_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "trust_metric_translations_trust_metric_id_locale_key" ON "trust_metric_translations"("trust_metric_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "navigation_menus_key_key" ON "navigation_menus"("key");

-- CreateIndex
CREATE INDEX "navigation_items_menu_id_parent_id_sort_order_idx" ON "navigation_items"("menu_id", "parent_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "navigation_item_translations_navigation_item_id_locale_key" ON "navigation_item_translations"("navigation_item_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "global_settings_key_key" ON "global_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "redirects_source_path_key" ON "redirects"("source_path");

-- CreateIndex
CREATE INDEX "redirects_active_source_path_idx" ON "redirects"("active", "source_path");

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE INDEX "leads_phone_idx" ON "leads"("phone");

-- CreateIndex
CREATE INDEX "leads_status_created_at_idx" ON "leads"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "leads_assigned_to_user_id_status_idx" ON "leads"("assigned_to_user_id", "status");

-- CreateIndex
CREATE INDEX "leads_source_type_created_at_idx" ON "leads"("source_type", "created_at" DESC);

-- CreateIndex
CREATE INDEX "leads_service_id_created_at_idx" ON "leads"("service_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "lead_notes_lead_id_created_at_idx" ON "lead_notes"("lead_id", "created_at");

-- CreateIndex
CREATE INDEX "lead_activities_lead_id_created_at_idx" ON "lead_activities"("lead_id", "created_at");

-- CreateIndex
CREATE INDEX "assessments_lead_id_idx" ON "assessments"("lead_id");

-- CreateIndex
CREATE INDEX "idempotency_records_expires_at_idx" ON "idempotency_records"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_records_key_endpoint_key" ON "idempotency_records"("key", "endpoint");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_created_at_idx" ON "audit_logs"("entity_type", "entity_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_created_at_idx" ON "audit_logs"("actor_user_id", "created_at");

-- CreateIndex
CREATE INDEX "notification_deliveries_status_created_at_idx" ON "notification_deliveries"("status", "created_at");

-- CreateIndex
CREATE INDEX "notification_deliveries_related_entity_type_related_entity__idx" ON "notification_deliveries"("related_entity_type", "related_entity_id");

-- CreateIndex
CREATE INDEX "product_venture_media_media_id_idx" ON "product_venture_media"("media_id");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "media_folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "media_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_translations" ADD CONSTRAINT "media_translations_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_translations" ADD CONSTRAINT "media_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_variants" ADD CONSTRAINT "media_variants_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_translations" ADD CONSTRAINT "page_translations_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_translations" ADD CONSTRAINT "page_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_translations" ADD CONSTRAINT "page_translations_og_media_id_fkey" FOREIGN KEY ("og_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_section_translations" ADD CONSTRAINT "page_section_translations_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "page_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_section_translations" ADD CONSTRAINT "page_section_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_icon_media_id_fkey" FOREIGN KEY ("icon_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_category_translations" ADD CONSTRAINT "service_category_translations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_category_translations" ADD CONSTRAINT "service_category_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_hero_media_id_fkey" FOREIGN KEY ("hero_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_icon_media_id_fkey" FOREIGN KEY ("icon_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_translations" ADD CONSTRAINT "service_translations_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_translations" ADD CONSTRAINT "service_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_translations" ADD CONSTRAINT "service_translations_og_media_id_fkey" FOREIGN KEY ("og_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industries" ADD CONSTRAINT "industries_hero_media_id_fkey" FOREIGN KEY ("hero_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_translations" ADD CONSTRAINT "industry_translations_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_translations" ADD CONSTRAINT "industry_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_translations" ADD CONSTRAINT "industry_translations_og_media_id_fkey" FOREIGN KEY ("og_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_industries" ADD CONSTRAINT "service_industries_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_industries" ADD CONSTRAINT "service_industries_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_logo_media_id_fkey" FOREIGN KEY ("logo_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_translations" ADD CONSTRAINT "client_translations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_translations" ADD CONSTRAINT "client_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_hero_media_id_fkey" FOREIGN KEY ("hero_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_study_translations" ADD CONSTRAINT "case_study_translations_case_study_id_fkey" FOREIGN KEY ("case_study_id") REFERENCES "case_studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_study_translations" ADD CONSTRAINT "case_study_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_study_translations" ADD CONSTRAINT "case_study_translations_og_media_id_fkey" FOREIGN KEY ("og_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_study_services" ADD CONSTRAINT "case_study_services_case_study_id_fkey" FOREIGN KEY ("case_study_id") REFERENCES "case_studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_study_services" ADD CONSTRAINT "case_study_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_study_industries" ADD CONSTRAINT "case_study_industries_case_study_id_fkey" FOREIGN KEY ("case_study_id") REFERENCES "case_studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_study_industries" ADD CONSTRAINT "case_study_industries_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_study_media" ADD CONSTRAINT "case_study_media_case_study_id_fkey" FOREIGN KEY ("case_study_id") REFERENCES "case_studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_study_media" ADD CONSTRAINT "case_study_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_category_translations" ADD CONSTRAINT "insight_category_translations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "insight_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_category_translations" ADD CONSTRAINT "insight_category_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "insight_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_cover_media_id_fkey" FOREIGN KEY ("cover_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_downloadable_media_id_fkey" FOREIGN KEY ("downloadable_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_translations" ADD CONSTRAINT "insight_translations_insight_id_fkey" FOREIGN KEY ("insight_id") REFERENCES "insights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_translations" ADD CONSTRAINT "insight_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_translations" ADD CONSTRAINT "insight_translations_og_media_id_fkey" FOREIGN KEY ("og_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_translations" ADD CONSTRAINT "tag_translations_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_translations" ADD CONSTRAINT "tag_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_tags" ADD CONSTRAINT "insight_tags_insight_id_fkey" FOREIGN KEY ("insight_id") REFERENCES "insights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_tags" ADD CONSTRAINT "insight_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_services" ADD CONSTRAINT "insight_services_insight_id_fkey" FOREIGN KEY ("insight_id") REFERENCES "insights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_services" ADD CONSTRAINT "insight_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_industries" ADD CONSTRAINT "insight_industries_insight_id_fkey" FOREIGN KEY ("insight_id") REFERENCES "insights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_industries" ADD CONSTRAINT "insight_industries_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faq_translations" ADD CONSTRAINT "faq_translations_faq_id_fkey" FOREIGN KEY ("faq_id") REFERENCES "faqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faq_translations" ADD CONSTRAINT "faq_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_faqs" ADD CONSTRAINT "service_faqs_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_faqs" ADD CONSTRAINT "service_faqs_faq_id_fkey" FOREIGN KEY ("faq_id") REFERENCES "faqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_faqs" ADD CONSTRAINT "page_faqs_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_faqs" ADD CONSTRAINT "page_faqs_faq_id_fkey" FOREIGN KEY ("faq_id") REFERENCES "faqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_photo_media_id_fkey" FOREIGN KEY ("photo_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member_translations" ADD CONSTRAINT "team_member_translations_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "team_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member_translations" ADD CONSTRAINT "team_member_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_logo_media_id_fkey" FOREIGN KEY ("logo_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_translations" ADD CONSTRAINT "partner_translations_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_translations" ADD CONSTRAINT "partner_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_media_id_fkey" FOREIGN KEY ("logo_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_cover_media_id_fkey" FOREIGN KEY ("cover_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_translations" ADD CONSTRAINT "brand_translations_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_translations" ADD CONSTRAINT "brand_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_translations" ADD CONSTRAINT "brand_translations_og_media_id_fkey" FOREIGN KEY ("og_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_ventures" ADD CONSTRAINT "product_ventures_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_ventures" ADD CONSTRAINT "product_ventures_logo_media_id_fkey" FOREIGN KEY ("logo_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_venture_translations" ADD CONSTRAINT "product_venture_translations_product_venture_id_fkey" FOREIGN KEY ("product_venture_id") REFERENCES "product_ventures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_venture_translations" ADD CONSTRAINT "product_venture_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_venture_translations" ADD CONSTRAINT "product_venture_translations_og_media_id_fkey" FOREIGN KEY ("og_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_case_study_id_fkey" FOREIGN KEY ("case_study_id") REFERENCES "case_studies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_logo_media_id_fkey" FOREIGN KEY ("logo_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonial_translations" ADD CONSTRAINT "testimonial_translations_testimonial_id_fkey" FOREIGN KEY ("testimonial_id") REFERENCES "testimonials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonial_translations" ADD CONSTRAINT "testimonial_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_logo_media_id_fkey" FOREIGN KEY ("logo_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_translations" ADD CONSTRAINT "certification_translations_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_translations" ADD CONSTRAINT "certification_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_metric_translations" ADD CONSTRAINT "trust_metric_translations_trust_metric_id_fkey" FOREIGN KEY ("trust_metric_id") REFERENCES "trust_metrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_metric_translations" ADD CONSTRAINT "trust_metric_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "navigation_menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "navigation_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "navigation_item_translations" ADD CONSTRAINT "navigation_item_translations_navigation_item_id_fkey" FOREIGN KEY ("navigation_item_id") REFERENCES "navigation_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "navigation_item_translations" ADD CONSTRAINT "navigation_item_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_settings" ADD CONSTRAINT "global_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_duplicate_of_id_fkey" FOREIGN KEY ("duplicate_of_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_venture_media" ADD CONSTRAINT "product_venture_media_product_venture_id_fkey" FOREIGN KEY ("product_venture_id") REFERENCES "product_ventures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_venture_media" ADD CONSTRAINT "product_venture_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- PostgreSQL invariants not expressible in the Prisma schema.
CREATE UNIQUE INDEX "languages_one_active_default" ON "languages" ("is_default") WHERE "is_default" = true;
ALTER TABLE "languages" ADD CONSTRAINT "default_language_active" CHECK (NOT "is_default" OR "is_active");
CREATE UNIQUE INDEX "media_folders_root_name_key" ON "media_folders" ("name") WHERE "parent_id" IS NULL;
ALTER TABLE "redirects" ADD CONSTRAINT "redirect_status_code" CHECK ("status_code" IN (301, 302, 307, 308));
ALTER TABLE "redirects" ADD CONSTRAINT "redirect_distinct_paths" CHECK ("source_path" <> "destination_path");
ALTER TABLE "media" ADD CONSTRAINT "media_size_positive" CHECK ("size_bytes" > 0);
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonial_public_consent" CHECK ("status" <> 'published' OR "consent_confirmed");
ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_not_self_parent" CHECK ("parent_id" IS DISTINCT FROM "id");
ALTER TABLE "media_folders" ADD CONSTRAINT "folder_not_self_parent" CHECK ("parent_id" IS DISTINCT FROM "id");
CREATE INDEX "insight_translations_search" ON "insight_translations" USING GIN (to_tsvector('simple', "title" || ' ' || "excerpt"));

COMMIT;
