# GATEVIA — Media Library Contract
**Document ID:** GTV-MEDIA-001  
**Version:** v0.2 Draft  
**Status:** Technical / Functional Contract

---

## 1. Goal

Media Library مركزية لإدارة جميع ملفات الموقع وإعادة استخدامها دون تكرار الرفع.

## 2. Supported Media Types

### Images
- JPG/JPEG.
- PNG.
- WebP.
- AVIF if supported.
- SVG وفق سياسة أمان صارمة.

### Documents
- PDF.
- DOCX optional.
- XLSX optional.
- PPTX optional.

### Video
Policy options:
1. External embed only.
2. Direct upload to R2.
3. Hybrid.

**Recommended V1:** Hybrid with size limits.

## 3. Storage

Files stored in:
- Cloudflare R2 or S3-compatible object storage.

Database stores metadata only.

## 4. Media Entity

Fields:
- id.
- storage_provider.
- storage_key.
- bucket.
- original_filename.
- normalized_filename.
- mime_type.
- extension.
- size_bytes.
- width.
- height.
- duration optional.
- checksum optional.
- folder_id.
- uploaded_by.
- created_at.
- updated_at.
- status.

## 5. Media Translation

Fields:
- media_id.
- locale.
- alt_text.
- caption.
- title optional.

## 6. Folders

Support:
- Create.
- Rename.
- Move Media.
- Nested folders optional.

Recommended top-level folders:
```text
Brand
Services
Industries
Case Studies
Team
Insights
Ecosystem
Documents
```

## 7. Upload UX

- Drag & Drop.
- Multi-upload.
- Progress indicator.
- Errors per file.
- Validation before upload.
- Retry failed upload.

## 8. Search & Filters

Search by:
- Filename.
- Title.
- Alt Text.

Filter by:
- Type.
- Folder.
- Uploader.
- Date.
- Dimensions.
- Usage status.

## 9. Image Processing

Generate variants:
- Thumbnail.
- Small.
- Medium.
- Large.
- Original.

Responsive delivery:
- srcset.
- sizes.
- WebP/AVIF when beneficial.

## 10. Safe Delete

Before delete:
- detect references.
- show usage count.
- block or warn.

Recommended:
- soft delete first.
- permanent delete restricted.

## 11. Replace File

Optional:
- replace binary while preserving media ID.
- regenerate variants.
- clear CDN cache where needed.

## 12. Usage References

Admin should show:
```text
Used in:
- Home Hero
- Service: Market Research
- Insight: ...
```

## 13. Security

- MIME validation.
- Extension validation.
- Max file size.
- SVG sanitization.
- Signed or backend-mediated upload.
- No executable files.
- Randomized storage keys.
- No user-controlled filesystem paths.

## 14. Suggested Size Policy

Final values configurable.

Suggested defaults:
- Image: 10 MB.
- PDF: 25 MB.
- Direct Video: 200 MB or lower depending on infrastructure.

## 15. Public vs Private

V1 public media:
- public via CDN where appropriate.

Future Client Portal:
- private / signed URLs.

لا يتم خلط private-media assumptions مع V1 العام.

## 16. Video Embed

For YouTube/Vimeo:
- store normalized provider + video ID.
- do not save arbitrary iframe HTML.

## 17. Media Picker

جميع CMS forms تستخدم Media Picker موحدًا.

## 18. Accessibility

- Prompt for Alt Text.
- Decorative images can be marked decorative.

## 19. CDN

Prefer CDN delivery with appropriate cache headers.

## 20. Audit

Track:
- Upload.
- Rename.
- Move.
- Replace.
- Delete.

## 21. Client Decisions

- [ ] Direct Video Upload؟
- [ ] Maximum Video Size؟
- [ ] Document Types Allowed؟
- [ ] Public Download Reports؟
- [ ] Nested Folders؟
- [ ] Bulk Delete؟
