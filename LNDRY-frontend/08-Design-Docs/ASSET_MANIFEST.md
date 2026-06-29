# LNDRY Production Asset Manifest

The `LndryUI/` sheet is the visual source of truth. New production assets live under `assets/brand/v2/`. Earlier PNG icons and hero experiments remain only as audit history and are not approved for product use.

## Art Direction

- **Product icons:** true transparent SVG, 24 x 24 grid, 1.75 px rounded stroke, violet contour, one soft-lavender duotone fill.
- **Brand encoding:** every icon structurally contains the LNDRY careline—an `L` seam, three short stitches, or a thread node. It must read as part of the object, not a pasted logo.
- **Story illustrations:** premium soft-3D objects, upper-left studio light, lavender bounce, modest depth, clean silhouette, transparent PNG/WebP.
- **UI mockups:** realistic Flutter layouts derived from the approved sheet; no pseudo-text and no unsupported features.
- **Backgrounds:** transparent for icons and object cutouts; solid/gradient only for intentional banners and full-screen compositions.

## Generation Sequence

| Phase | Family | Required assets | Source format | Status |
| --- | --- | --- | --- | --- |
| 01 | Core logo | careline symbol, horizontal wordmark, app icon | SVG | Complete |
| 02 | Required service icons | wash & fold, wash & iron, dry cleaning, steam press, shoe care, bag care, premium garment care, tailoring, curtain, carpet, blanket | SVG | Complete |
| 03 | Additional icon families | Generate only when a real screen requires a missing symbol | SVG | Deferred by design |
| 04 | System states | empty orders, no service area, offline, payment failure | SVG + UI mockup PNG | Complete |
| 05 | Core 3D services | folded laundry, iron, dry-clean suit, steam press, shoe-and-brush, premium bag, tailoring machine, curtains, carpet roll, blanket | transparent PNG | Complete |
| 06 | Story scenes | relief/home hero, pickup, processing, quality check, packaging, delivery | transparent PNG | Complete |
| 07 | Commercial banners | first pickup, compare partners, care-process tracking | PNG | Complete |
| 08 | Customer UI mockups | onboarding, location, cart, slot selection, payment, confirmation, tracking, delivered, history, support | PNG | Complete |
| 09 | Customer authentication | mobile sign-in and OTP verification | PNG | Complete |
| 10 | Customer P0 completion | garment selection, vendor wait/rejection, pickup and delivery OTP, payment pending, notifications, slot full, location permission, OTP recovery, final weight update, rating | PNG | Complete |
| 11 | Customer P1 production | profile, addresses, search, filters, partner information, cancellation, support, loading fallbacks | HTML source + PNG | 14-screen PNG family complete and visually reviewed |
| 12 | Vendor application and operations | onboarding, approval, setup, services, capacity, orders, employees, processing, performance | HTML source + PNG | 19-screen family complete and visually reviewed |
| 13 | Delivery employee operations | assignments, Maps handoff, pickup and delivery OTP, completion and recovery states | HTML source + PNG | 14-screen family complete and visually reviewed |
| 14 | Admin operations | secure access, vendor review, users, orders, exceptions, reports, templates, audit | HTML source + PNG | 17-screen family complete and visually reviewed |
| 15 | Deployment and release | adaptive icon layers, monochrome icon, notification icon, iOS master, launch screens, web icons, Flutter/WebP exports, store media | SVG + PNG + WebP | Complete and visually reviewed |

## Required Export Sets

- SVG icons: `currentColor`-ready monochrome plus branded duotone master.
- Raster icons only when needed: 24, 32, 48, 72, 96 px at lossless PNG.
- 3D card objects: 1024 x 1024 transparent master, WebP derivatives at 256/512/768 px.
- Hero cutouts: 1536 x 1024 transparent master with protected copy-safe area.
- Promotional banners: 3:1, 2:1, and 16:9 layouts built from the same reusable cutouts.

## Approved Current Inventory

### Banners

- `assets/brand/v2/banners/first-pickup-v1.png`
- `assets/brand/v2/banners/compare-partners-v1.png`
- `assets/brand/v2/banners/care-process-v1.png`

### Customer Mockups

- `assets/brand/v2/mockups/onboarding-convenience-v1.png`
- `assets/brand/v2/mockups/sign-in-mobile-v1.png`
- `assets/brand/v2/mockups/otp-verification-v1.png`
- `assets/brand/v2/mockups/location-serviceability-v1.png`
- `assets/brand/v2/mockups/review-order-v1.png`
- `assets/brand/v2/mockups/schedule-pickup-v1.png`
- `assets/brand/v2/mockups/payment-v1.png`
- `assets/brand/v2/mockups/order-confirmation-v1.png`
- `assets/brand/v2/mockups/track-order-v1.png`
- `assets/brand/v2/mockups/order-delivered-v1.png`
- `assets/brand/v2/mockups/order-history-v1.png`
- `assets/brand/v2/mockups/help-support-v1.png`
- `assets/brand/v2/mockups/state-empty-orders-v1.png`
- `assets/brand/v2/mockups/state-no-service-area-v1.png`
- `assets/brand/v2/mockups/state-offline-v1.png`
- `assets/brand/v2/mockups/state-payment-failure-v1.png`
- `assets/brand/v2/mockups/garments-v1.png`
- `assets/brand/v2/mockups/waiting-v1.png`
- `assets/brand/v2/mockups/rejected-v1.png`
- `assets/brand/v2/mockups/pickup-otp-v1.png`
- `assets/brand/v2/mockups/delivery-otp-v1.png`
- `assets/brand/v2/mockups/rating-v1.png`
- `assets/brand/v2/mockups/payment-pending-v1.png`
- `assets/brand/v2/mockups/notifications-v1.png`
- `assets/brand/v2/mockups/slot-full-v1.png`
- `assets/brand/v2/mockups/location-permission-v1.png`
- `assets/brand/v2/mockups/otp-invalid-v1.png`
- `assets/brand/v2/mockups/otp-expired-v1.png`
- `assets/brand/v2/mockups/otp-locked-v1.png`
- `assets/brand/v2/mockups/quote-adjustment-v1.png`

### Deployment Assets

- `assets/brand/v2/deployment/android-adaptive-foreground.svg`
- `assets/brand/v2/deployment/android-adaptive-background.svg`
- `assets/brand/v2/deployment/android-monochrome.svg`
- `assets/brand/v2/deployment/notification-small.svg`
- `assets/brand/v2/deployment/ios-app-icon-1024.png`
- `assets/brand/v2/deployment/web-app-icon-512.png`
- `assets/brand/v2/deployment/web-app-icon-192.png`
- `assets/brand/v2/deployment/map-pin-careline.svg`
- `assets/brand/v2/deployment/avatar-placeholder.svg`
- `assets/brand/v2/deployment/vendor-store-placeholder.svg`

### Customer P1 Mockups

- `assets/brand/v2/mockups/profile-v1.png`
- `assets/brand/v2/mockups/addresses-v1.png`
- `assets/brand/v2/mockups/search-recent-v1.png`
- `assets/brand/v2/mockups/search-empty-v1.png`
- `assets/brand/v2/mockups/filters-v1.png`
- `assets/brand/v2/mockups/vendor-info-v1.png`
- `assets/brand/v2/mockups/cancel-order-v1.png`
- `assets/brand/v2/mockups/support-ticket-v1.png`
- `assets/brand/v2/mockups/skeletons-v1.png`

### Authored Multi-Surface Sources

- `assets/brand/v2/previews/customer-p1-flows.html`
- `assets/brand/v2/previews/vendor-flows.html`
- `assets/brand/v2/previews/rider-flows.html`
- `assets/brand/v2/previews/admin-flows.html`

### Release and Flutter Exports

- `assets/brand/v2/deployment/launch-screen-light.svg`
- `assets/brand/v2/deployment/launch-screen-dark.svg`
- `assets/brand/v2/deployment/launch-screen-light-3x.png`
- `assets/brand/v2/deployment/launch-screen-dark-3x.png`
- `assets/brand/v2/deployment/favicon-32.png`
- `assets/brand/v2/deployment/favicon-48.png`
- `assets/brand/v2/webp/256/`
- `assets/brand/v2/webp/512/`
- `assets/brand/v2/webp/768/`
- `assets/brand/v2/webp/banners/`
- `assets/brand/v2/flutter/illustrations/`
- `assets/brand/v2/flutter/illustrations/2.0x/`
- `assets/brand/v2/flutter/illustrations/3.0x/`

### Store-Listing Media

- `assets/brand/v2/store-media/google-play/feature-graphic-1024x500.png`
- `assets/brand/v2/store-media/google-play/01-effortless-care-1080x1920.png`
- `assets/brand/v2/store-media/google-play/02-local-partners-1080x1920.png`
- `assets/brand/v2/store-media/google-play/03-order-confidence-1080x1920.png`
- `assets/brand/v2/store-media/google-play/04-flexible-pickup-1080x1920.png`
- `assets/brand/v2/store-media/google-play/05-care-tracking-1080x1920.png`
- `assets/brand/v2/store-media/google-play/06-verified-delivery-1080x1920.png`
- `assets/brand/v2/store-media/app-store/iphone-6.9/` — six 1290 x 2796 PNG screenshots

### Scope Guard

Do not generate extra garment, navigation, trust, or status icon families speculatively. Add a new icon only when an approved screen cannot be implemented with the existing service icons, standard platform symbols, or a clearly required product-specific symbol.

## Rejection Criteria

- Checkerboard pixels or opaque white boxes in a transparent deliverable.
- Cyan/turquoise used as the dominant brand color.
- Neon glow, dark vignette, dirty gray cast, crushed shadows, or excessive gloss.
- Generic icon that does not carry the careline construction.
- Misspelled `LNDRY`, random labels, or illegible micro-text.
- Perspective, lighting, or material mismatch within one family.
- Service, pricing, tracking, or marketing claims not present in the approved workflow.
