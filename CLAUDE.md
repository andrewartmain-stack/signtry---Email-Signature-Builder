# SignTry

SignTry is a Next.js app for creating, customizing, saving, copying, and tracking professional email signatures. Users can add contact details, photos, logos, banners, social links, badges, and buttons, then install signatures in Gmail, Outlook, Apple Mail, or Thunderbird.

## Users

- Individuals and solopreneurs who want a polished signature with minimal effort.
- Business owners managing large teams who need consistent signatures at scale.

Support both audiences. Bulk generation exists: one design plus a CSV of team members creates one saved signature per person (`BulkGenerateDialog`), within the plan's signature limit. Do not assume team accounts, member invitations, or centralized employee management exist. Verify product behavior in code before describing or extending it.

## Stack and structure

Next.js App Router, React, TypeScript, Tailwind CSS, Supabase (auth/database/storage), and Stripe.

- `src/app/(dashboard)/`: builder, saved signatures, analytics, guides, pricing.
- `src/app/(auth)/`: authentication and subscription onboarding.
- `src/app/api/`: API routes.
- `src/app/components/`: app components.
- `src/app/utils/`: Supabase, Stripe, and signature helpers.
- `components/ui/`: shared UI primitives.

## Guidelines

- Follow existing patterns; keep server-side auth/data loading on the server and use client components for interactive UI.
- Preserve strict TypeScript, user-scoped data access, and existing Supabase/Stripe contracts.
- Email-client compatibility is essential: take care when changing signature HTML, images, copy behavior, or tracked links.
- UI follows `DESIGN.md` (Geist, Ink/cream palette, light only). Reuse `PageHeader`, `useToast`, `SegmentedControl`, `Switch` and `ScaledSignature`; the builder's state-to-template logic lives in `utils/signatureDesign.ts`.
- Templates: "general" ones come from the `signature_html_templates` table; industry templates (real estate, marketing, healthcare, freelance, legal/finance, corporate) are code in `templates/industryTemplates.ts`, built from shared email-safe blocks. The builder only shows fields and style options (accent color, font) whose placeholders the selected template contains.
- Keep the UX simple and responsive. Do not expose team features unless implemented end to end.
- Make focused changes, reuse existing helpers, and run the smallest relevant validation. Report checks not run or failures honestly.
