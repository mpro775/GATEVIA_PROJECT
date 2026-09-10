# GATEVIA — Brand & Design System Direction
**Document ID:** GTV-BRAND-001  
**Version:** v0.3 Draft  
**Status:** Design Direction — Requires Brand Approval

---

## 1. Source

هذا التوجه مبني على الهوية البصرية المقدمة حاليًا لـGATEVIA:
- شعار هندسي.
- هوية ثنائية الوضع: **Light Mode + Dark Mode**.
- Navy / Black كأساس بصري قوي في Dark Mode.
- White / Off-White / Light Neutrals كأسطح رئيسية في Light Mode.
- White وNavy/Charcoal لأدوار النص والتباين حسب الوضع.
- Lime / Electric Green Accent في كلا الوضعين.
- مفهوم بصري قريب من Gateway / Entry / Direction / Growth.

**تنبيه:** عند توفر Brand Guidelines رسمية فإنها تتقدم على هذه الوثيقة.

## 2. Brand Positioning Expression

Visual direction should communicate:
- Confidence.
- Market Intelligence.
- Precision.
- Access.
- Movement.
- Growth.
- Premium B2B.

Avoid:
- Generic corporate templates.
- Excessive gradients.
- Neon overload.
- Decorative complexity.
- Playful consumer-startup style.

## 3. Core Visual Concept

> **Gateway → Path → Market → Growth**

Possible motifs:
- Perspective lines.
- Framed portal shapes.
- Directional arrows.
- Layered planes.
- Entry-point animations.
- Path transitions.

## 4. Color Roles & Theme Modes

GATEVIA is a **dual-theme product**. Both modes are first-class, production-ready experiences. A page containing occasional light/dark sections inside one theme does **not** satisfy this requirement.

### Dark Mode
- Navy / Black / Deep Neutral for primary page backgrounds.
- Elevated dark neutrals for cards, menus, modals and secondary surfaces.
- White / near-white for primary text.
- Muted light neutrals for secondary text.
- Lime / Electric Green for controlled emphasis and interaction.

### Light Mode
- White / Off-White / Light Neutral for primary page backgrounds.
- White / subtle neutral elevated surfaces for cards, menus, modals and secondary surfaces.
- Navy / Charcoal for primary text.
- Mid-neutral tones for secondary text.
- Lime / Electric Green remains the brand accent, using a contrast-safe token when necessary.

### Intentional Brand Sections
Selected Hero, Footer or premium campaign sections may remain intentionally dark in Light Mode when the design calls for it, but the **overall application must visibly and functionally switch themes**. These sections must use semantic tokens and preserve contrast in both modes.

### Lime / Electric Green
Accent only:
- Primary CTA.
- Active states.
- Key metrics.
- Hover indicators.
- Arrows.
- Small highlights.

### Neutral Grays
Theme-specific neutrals are used for:
- Borders.
- Muted text.
- Secondary surfaces.
- Disabled states.
- Dividers.

**Rules:**
- Green should not dominate large surfaces.
- Do not implement Light Mode with `filter: invert()` or automatic color inversion.
- Do not hardcode a dark-only component. Every shared component must have defined behavior in both themes.

## 5. Exact Color Values

Not locked until official source files are received.
Developer must not invent final production brand HEX values without approval.

Temporary **semantic** design tokens (same token names in both modes, values change by theme):
```text
--color-bg-canvas
--color-bg-surface
--color-bg-elevated
--color-bg-inverse
--color-text-primary
--color-text-secondary
--color-text-muted
--color-text-inverse
--color-border-default
--color-border-strong
--color-accent
--color-accent-hover
--color-accent-foreground
--color-focus-ring
--color-success
--color-warning
--color-danger
--shadow-sm
--shadow-md
--shadow-lg
```

Raw brand palette tokens may exist underneath, but components must consume semantic tokens rather than direct palette values.

## 6. Typography

Requirements:
- Arabic and Latin pair feel coherent.
- Excellent readability.
- Professional.
- Multiple weights.
- Web licensing acceptable.

Process:
1. Confirm official brand font.
2. If absent, propose Arabic + Latin pair.
3. Review bilingual headings.
4. Lock after client approval.

## 7. Type Scale

Token system:
```text
display-xl
display-lg
h1
h2
h3
h4
body-lg
body
body-sm
caption
```

Responsive scaling required.

## 8. Spacing System

Recommended scale:
```text
4
8
12
16
24
32
48
64
96
128
```

Avoid arbitrary spacing.

## 9. Grid

- Desktop: 12-column.
- Tablet: flexible 8-column equivalent.
- Mobile: 4-column concept.
- Tokenized max container widths.

## 10. Border Radius

The brand should feel precise, not overly soft.
Use small/moderate radii.
Avoid consumer-app pill overload.

## 11. Buttons

Types:
- Primary.
- Secondary.
- Tertiary / Text.
- Icon Button.

States:
- Default.
- Hover.
- Active.
- Focus.
- Disabled.
- Loading.

## 12. Forms

Elements:
- Text.
- Email.
- Phone.
- Select.
- Textarea.
- Checkbox.
- Radio.
- Multi-step Assessment.

Requirements:
- Clear labels.
- Validation.
- Focus states.
- RTL/LTR.
- Accessible errors.

## 13. Cards

Types:
- Service Card.
- Industry Card.
- Case Study Card.
- Insight Card.
- Brand/Product Card.
- Testimonial Card.

All should share the same visual language.

## 14. Navigation

Desktop:
- Minimal.
- Premium.
- CTA distinct.
- Mega Menu only where useful.

Mobile:
- Drawer or full-screen.
- Clear hierarchy.

## 15. Hero

Hero may use:
- Portal / Perspective visual.
- Restrained animation.
- Clear H1.
- Maximum 1–2 CTAs.
- Nearby trust evidence.

## 16. Motion

Principles:
- Purposeful.
- Subtle.
- Performant.
- Respect `prefers-reduced-motion`.

Good uses:
- Line progression.
- Fade/translate.
- Portal reveal.
- Number count-up.
- Card hover.

Avoid:
- Heavy parallax.
- Continuous distracting motion.
- Slow intro screens.

## 17. Iconography

Use one icon family.
Style:
- Geometric.
- Minimal.
- Consistent stroke.

## 18. Photography / Visual Assets

Preferred:
- Saudi business context.
- Architecture.
- Strategy/workshops.
- Market/infrastructure.
- High-quality authentic imagery.

Avoid:
- Generic handshake stock.
- Low-quality AI visuals.
- Inconsistent photography style.

## 19. Data Visualization

If charts are used:
- Full Light and Dark theme variants.
- Theme-aware grid, axis, tooltip, legend and label colors.
- Accent only for emphasis.
- Readable labels.
- No decorative data without source.

## 20. RTL Rules

Design must support:
- Logical spacing.
- Correct directional icons.
- Correct breadcrumb flow.
- Correct slider direction.
- Correct form alignment.

Brand logo is never mirrored unless official rules require it.

## 21. Accessibility

Minimum:
- WCAG-aware contrast.
- Keyboard focus.
- Readable font size.
- Visible errors.
- Alt text.
- Reduced motion.

## 22. Core Components Inventory

```text
Header
MegaMenu
MobileMenu
Footer
LanguageSwitcher
ThemeToggle
Button
IconButton
Link
Badge
Breadcrumb
SectionHeader
Hero
Card
LogoCloud
Stats
Timeline
Accordion
Tabs
Carousel
Quote
RichText
MediaBlock
FormField
Select
Textarea
Checkbox
Radio
Stepper
Modal
Toast
Pagination
Search
Filter
EmptyState
Skeleton
ErrorState
CTASection
```

## 23. Design Tokens

Recommended token groups:
```text
color.semantic.*
color.palette.*
theme.*
space.*
radius.*
shadow.*
font.*
size.*
lineHeight.*
zIndex.*
motion.*
breakpoint.*
container.*
```

## 24. Theme Behavior Contract

### Required modes
Only two user-facing appearance modes are required:
- `light`
- `dark`

System preference is used only to choose the **initial mode when no user preference exists**; it does not need to appear as a third selectable mode.

### Priority
```text
1. Persisted explicit user choice
2. prefers-color-scheme on first visit
3. Dark fallback
```

### Persistence
- The user's explicit choice must persist across reloads, routes and locale switches.
- Prefer a server-readable cookie so SSR can render the correct theme immediately.
- A client storage mirror may be used, but localStorage-only after hydration is not sufficient if it causes a visible flash.

### Rendering
- Theme must be applied on the document root (`html`) using `data-theme="light|dark"`, a class, or an equivalent deterministic approach.
- Set browser `color-scheme` appropriately.
- Avoid visible FOUC / wrong-theme paint.
- Avoid hydration mismatch.
- Theme switching is client-side and must not force a full page reload.

### Toggle UX
- Public Desktop Header: visible and keyboard-accessible.
- Public Mobile Navigation: available without hunting through deep menus.
- Admin App Shell: visible in the user/global controls area.
- Must expose an accessible label/state; icon-only controls require an accessible name.

### Asset rules
- Support logo/illustration variants when contrast requires them.
- Client/partner logos must not be color-inverted automatically.
- Photography should remain natural; theme adaptation should happen through framing/surfaces, not destructive image filters.

### Component coverage
Every core component and every UI state defined by this system must be visually reviewed in both themes.

## 25. Page Visual Hierarchy

Every page should clearly separate:
- Orientation.
- Proof.
- Explanation.
- Detail.
- Conversion.

Avoid long undifferentiated text walls.

## 26. Design Approval Inputs Needed

From client:
- [ ] Vector Logo.
- [ ] Official Colors.
- [ ] Official Fonts.
- [ ] Brand Guidelines.
- [ ] Photography Direction.
- [ ] Examples they like.
- [ ] Examples they dislike.
- [ ] Partner/Client Logo permissions.
- [ ] Language priority.

## 27. Design Freeze Rule

No final UI implementation is visually approved until these reference screens are reviewed:
1. Home Desktop — Light.
2. Home Desktop — Dark.
3. Home Mobile — Light.
4. Home Mobile — Dark.
5. Service Detail — Light/Dark.
6. Insight Detail — Light/Dark.
7. Admin Content Form — Light/Dark.
8. Arabic RTL — Light/Dark.
9. English LTR — Light/Dark.

## 28. Implemented Public-Web Convention — Premium Rebuild

The approved public presentation layer uses a restrained architectural **Gateway System** made from frames, offset planes, perspective paths, market points, and numeric markers. The device may be varied by context; it must not become a repeated decorative logo.

The implemented typography is centralized through `--font-latin`, `--font-arabic`, `--font-display`, and `--font-body`. The current production-safe system stacks are temporary until official licensed brand fonts are supplied. Arabic uses independent metrics and never inherits Latin tracking.

The semantic theme now includes canvas-subtle, surface-hover, accent-subtle, text-accent, subtle/inverse borders, active accent, overlay, and five shadow levels. Public components consume semantic roles only. Responsive composition follows 12-column desktop, 8-column-equivalent tablet, and 4-column mobile logic with explicit large desktop, compact desktop, tablet, and phone adaptations.

Public UI icons use the internal tree-shakeable geometric SVG `Icon` component. Directional icons are mirrored only in RTL contexts where direction carries meaning. Motion is CSS-first, subtle, and disabled through `prefers-reduced-motion`.

Resource families have distinct visual grammar: services are structured strategic tiles, industries are image-led split cards, case studies prioritize evidence and outcomes, insights use editorial metadata and covers, and ecosystem/people use compact identity-led cards.
