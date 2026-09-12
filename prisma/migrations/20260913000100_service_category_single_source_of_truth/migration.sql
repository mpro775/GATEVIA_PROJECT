ALTER TABLE "service_categories"
ADD COLUMN "cover_media_id" UUID;

CREATE INDEX "service_categories_cover_media_id_idx"
ON "service_categories"("cover_media_id");

ALTER TABLE "service_categories"
ADD CONSTRAINT "service_categories_cover_media_id_fkey"
FOREIGN KEY ("cover_media_id") REFERENCES "media"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
