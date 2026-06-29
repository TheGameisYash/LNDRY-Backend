---
name: LNDRY
description: A quietly premium careline system for India's multi-vendor laundry marketplace.
colors:
  primary-violet: "#6C63E8"
  deep-violet: "#5046C8"
  electric-lavender: "#887CF6"
  soft-lavender: "#EAE8FF"
  teal-accent: "#0FB5A6"
  teal-tint: "#DDF7F3"
  near-black-ink: "#080F14"
  secondary-ink: "#495467"
  muted-text: "#7E8998"
  app-background: "#F4F3FB"
  card-surface: "#FFFFFF"
  cool-surface: "#F7F8FC"
  hairline-border: "#E7E8F0"
  success: "#16A36A"
  warning: "#F3A929"
  error: "#D94557"
typography:
  display:
    fontFamily: "Sora, Inter, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.1875
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Sora, Inter, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.214
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Sora, Inter, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.294
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.467
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.385
    letterSpacing: "normal"
rounded:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  sheet: "28px"
  full: "999px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary-violet}"
    textColor: "{colors.card-surface}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
    padding: "14px 20px"
    height: "52px"
  button-secondary:
    backgroundColor: "{colors.card-surface}"
    textColor: "{colors.primary-violet}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "12px 18px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.primary-violet}"
    textColor: "{colors.card-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "10px 14px"
    height: "44px"
  chip-operational:
    backgroundColor: "{colors.teal-tint}"
    textColor: "{colors.teal-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "6px 10px"
  search-field:
    backgroundColor: "{colors.card-surface}"
    textColor: "{colors.secondary-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "56px"
  service-card:
    backgroundColor: "{colors.card-surface}"
    textColor: "{colors.near-black-ink}"
    rounded: "{rounded.md}"
    padding: "16px"
---

# Design System: LNDRY

## Overview

**Creative North Star: "The Careline Marketplace"**

LNDRY combines the calm precision of a garment care label with the transparent choice of a modern marketplace. White and cool-lavender surfaces keep comparison effortless; violet carries identity and primary action; teal appears only when the system communicates verified trust, availability, or operational progress.

The proprietary visual gesture is the **LNDRY careline**: a rounded `L` seam with three short stitch marks and a small thread node. It can be integrated into icons, garment seams, bag embroidery, progress paths, and motion—not pasted on as a decorative logo. Premium soft-3D objects provide emotional storytelling, while product controls stay crisp, familiar, and implementation-ready.

This system explicitly rejects generic AI laundry visuals, turquoise glow, baked checkerboards, unrelated icon families, and unsupported marketplace claims.

**Key Characteristics:**

- Bright, quiet, and reassuring rather than clinical.
- Familiar mobile controls with precise marketplace information.
- Violet-led identity with disciplined teal semantics.
- Rounded 1.75 px duotone icons carrying the LNDRY careline.
- Premium, softly lit 3D garment-care objects on transparent backgrounds.
- Eight-point spatial rhythm with generous 20 px screen gutters.

## Colors

The palette is a cool white-and-violet system with a deliberately scarce operational teal.

### Primary

- **Care Violet:** The identity anchor for primary actions, active navigation, selected filters, and branded icon strokes.
- **Deep Care Violet:** Pressed states, stronger emphasis, and dark gradient endpoints.
- **Electric Lavender:** Highlights, focus energy, and selective illustration accents.
- **Soft Lavender:** Icon duotone fills, quiet selected surfaces, and large low-contrast backplates.

### Secondary

- **Operational Teal:** Verified partners, available slots, live progress, pickup/delivery status, and success-adjacent operational feedback.
- **Teal Tint:** Soft backgrounds behind operational chips and trust cues.

### Tertiary

- **Success, Warning, and Error:** Reserved for their semantic states. They never substitute for brand color.

### Neutral

- **Near Black Ink:** Primary text and high-contrast icons.
- **Secondary Ink:** Supporting text and dense marketplace metadata.
- **Muted Text:** Captions, placeholders, and completed/inactive context.
- **App Background:** The cool canvas behind cards and sheets.
- **Card Surface:** Primary interactive and content surfaces.
- **Cool Surface:** Secondary panels, skeletons, and grouped controls.
- **Hairline Border:** Dividers and restrained card edges.

**The Teal Has a Job Rule.** Teal always means verified, available, successful, or in progress. Decorative teal is prohibited.

**The Violet Rarity Rule.** Saturated violet is concentrated in primary action and selection; it must not flood ordinary content surfaces.

## Typography

**Display Font:** Sora (with Inter and sans-serif fallback)  
**Body Font:** Inter (with sans-serif fallback)

**Character:** Sora gives headlines a calm geometric signature; Inter makes dense marketplace detail effortless to scan. Neither font is used decoratively.

### Hierarchy

- **Display** (Semibold, 32/38): Hero and onboarding statements only.
- **Headline** (Semibold, 28/34): Screen titles and major greeting moments.
- **Section Heading** (Semibold, 24/30): High-priority content groups.
- **Title** (Semibold, 17/22): Cards, services, dialogs, and important row labels.
- **Body** (Regular, 15/22): Explanations, descriptions, and support copy.
- **Label** (Medium, 13/18): Controls, chips, metadata, and field labels.
- **Caption** (Medium, 11/16): ETA, price basis, timestamps, and secondary evidence.
- **Price** (Bold, 18/22): Monetary values and estimated totals.

**The Scan in Three Seconds Rule.** Service, vendor, price basis, availability, and primary action must remain visually distinct at a glance.

## Elevation

Depth is ambient and restrained. Most separation comes from white surfaces on the cool app background plus a hairline border; shadow appears only on meaningful cards, sheets, and floating booking actions.

### Shadow Vocabulary

- **Soft Surface** (`0 4px 16px rgba(42, 36, 95, 0.08)`): Service cards, search fields, and small content groups.
- **Elevated Surface** (`0 12px 32px rgba(67, 55, 145, 0.10)`): Bottom sheets, floating booking controls, and modal confirmations.

**The No Halo Rule.** Dark outer glows, turquoise bloom, and neon edge lighting are forbidden. If an asset looks luminous rather than softly lit, it is off brand.

## Components

### Buttons

- **Shape:** Compact buttons use a confident 12 px radius; large booking actions may use 16 px.
- **Primary:** Care Violet with white text, 52 px height, and at least 20 px horizontal padding.
- **Pressed / Focus:** Pressed state shifts to Deep Care Violet; keyboard focus uses a 2 px Electric Lavender ring with 2 px offset.
- **Secondary:** White surface, 1 px violet border, violet label; never a pale disabled-looking fill.
- **Disabled:** Cool Surface with Muted Text and no shadow.

### Chips

- **Style:** Full-pill geometry, 44 px touch target, concise icon-plus-label composition.
- **State:** Selected filters use violet/white. Availability and verification use Teal Tint/Operational Teal. Unselected filters stay white with a hairline border.

### Cards / Containers

- **Corner Style:** 16 px compact cards, 20 px standard cards, 24 px hero cards.
- **Background:** White by default; Soft Lavender is limited to branded or selected sub-surfaces.
- **Shadow Strategy:** Soft Surface only when the border/background is insufficient.
- **Border:** 1 px Hairline Border; selected service cards use 1.5 px Care Violet.
- **Internal Padding:** 12 px compact, 16 px standard, 20-24 px hero.

### Inputs / Fields

- **Style:** White, full-pill search fields and 16 px structured fields, with a hairline border.
- **Focus:** Violet stroke plus accessible focus ring; placeholder remains secondary, never primary.
- **Error / Disabled:** Error text and icon accompany the color shift; disabled fields remain readable.

### Navigation

- Bottom navigation uses five stable destinations: Home, Explore, Book, Orders, Profile.
- The centered Book action may float as the distinctive marketplace shortcut, but its label remains visible.
- Active destinations use Care Violet and a filled duotone icon. Inactive destinations use Secondary Ink with consistent 24 px outlines.

### Service Icons

- Draw on a 24 x 24 grid with a 1.75 px rounded stroke.
- Use Care Violet for the main contour, Soft Lavender for one restrained duotone fill, and Operational Teal only for a genuine status detail.
- Integrate one careline seam: an `L`-shaped stitch, three micro-stitches, or a thread node structurally connected to the object.
- Export production icons as transparent SVG; PNG renditions are derived exports, never the source.

### Premium 3D Illustrations

- Use soft studio lighting from upper-left, subtle lavender bounce, clean material detail, and modest depth.
- Keep silhouettes readable at card size and leave intentional negative space for copy.
- Garment bags may carry the correctly spelled LNDRY wordmark. Tiny pseudo-text is forbidden.
- Export transparent PNG/WebP at 2x and 3x; avoid cast-shadow boxes that reveal the generation canvas.

## Do's and Don'ts

### Do:

- **Do** use the UI sheet in `LndryUI/` as the visual source of truth.
- **Do** preserve the violet LNDRY identity and use teal only for operational meaning.
- **Do** integrate the careline into the construction of the icon or illustration.
- **Do** make all icons true transparent SVGs and all 3D cutouts true transparent PNG/WebP.
- **Do** show marketplace evidence: rate basis, distance, availability, timing, ratings, and verification.
- **Do** design for WCAG 2.2 AA, 44 x 44 px targets, dynamic text, reduced motion, and low-bandwidth fallback.

### Don't:

- **Don't** create a generic laundry template built from washing-machine clip art, random bubbles, water drops, or stock blue gradients.
- **Don't** create an AI-generated collection of disconnected screens, glossy neon objects, illegible pseudo-text, or inconsistent icon styles.
- **Don't** copy a Dribbble concept that optimizes decoration over booking clarity.
- **Don't** compress the website into a mobile app.
- **Don't** bake checkerboards into files pretending to be transparent backgrounds.
- **Don't** use turquoise glow effects, dark halos, or synthetic 3D assets that conflict with the violet LNDRY identity.
- **Don't** imply unsupported subscription, loyalty, continuous live-rider-map, surge-pricing, or promotional claims.
