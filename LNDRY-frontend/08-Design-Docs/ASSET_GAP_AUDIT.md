# LNDRY Phase 1 Asset and Screen Coverage Audit

Date: 22 June 2026

## Decision

The existing V2 pack is a strong visual foundation and is sufficient to begin implementing the customer app shell. It is not yet sufficient to claim that the complete Phase 1 platform is designed or release-ready.

The approved workflow contains four operational surfaces:

1. Customer mobile app
2. Vendor owner and staff mobile app
3. Vendor delivery employee mobile access
4. Platform admin dashboard

The production pack covers Customer, Vendor, Delivery Employee, Admin, deployment, backend-defined exception states, and store-listing media.

## What Already Exists

| Family | Count | Coverage |
| --- | ---: | --- |
| Logo masters | 3 | Brand symbol, wordmark, compact app icon |
| Service icons | 11 | All approved laundry service categories |
| Transparent 3D illustrations | 17 | Core services and the main care journey |
| Promotional banners | 3 | First pickup, partner comparison, care process |
| Customer mockups | 16 | Authentication, booking, payment, tracking, history, support, four system states |
| State illustration masters | 4 | Empty orders, no service area, offline, payment failure |

## Customer App Gaps

### P0: Required before the customer workflow can be called complete

- Garment or estimated-weight selection
- Waiting for vendor confirmation
- Vendor rejection and auto-rejection recovery
- Pickup OTP handover
- Delivery OTP handover
- Rating and review submission
- Payment pending, refund, and reconciliation messaging
- Notification inbox
- Slot-full recovery
- Address/location-permission recovery
- OTP invalid, expired, resend cooldown, and retry-limit states
- Actual quantity or weight correction with revised final amount

### P1: Required for a polished production app

- Profile and account settings
- Saved-address list, add address, edit address, and delete confirmation
- Search with recent searches and no-results recovery
- Vendor filters, sorting, and comparison details
- Vendor profile about and reviews tabs
- Order cancellation with reason and refund expectation
- Support ticket or contact flow
- Skeletons for vendor lists, service details, orders, and notifications
- Reusable image fallbacks for missing vendor logo, shop photo, and customer avatar

## Vendor App Coverage

The complete 19-screen vendor application and operations family is authored, raster-exported, and visually reviewed. It covers:

- OTP sign-in and role selection
- Multi-step vendor application
- Document upload and validation
- Map pin and requested service radius
- Application submitted, correction requested, rejected, and approved
- Business profile setup
- Service creation, garment items, price basis, and publishing
- Capacity calendar and 60-minute slot limits
- Delivery employee management
- New order review, accept, reject, and auto-reject timer
- Assignment and reassignment
- Received quantity or weight verification
- Processing-stage updates
- Order audit trail
- Earnings and performance
- Empty, loading, offline, permission, and error states

## Delivery Employee App Coverage

The complete 14-screen delivery employee family is authored, raster-exported, and visually reviewed. It covers:

- Assignment list and assignment details
- Going for pickup
- External Google Maps handoff
- Pickup OTP entry, invalid OTP, and verified pickup
- Return-to-vendor confirmation
- Delivery assignment
- Out for delivery
- Delivery OTP entry, invalid OTP, and completion
- No assignments, offline, location permission, and call-customer fallback

## Admin Dashboard Coverage

The complete 17-screen admin operations family is authored, raster-exported, and visually reviewed. It covers:

- Secure sign-in and second factor
- Dashboard shell and navigation
- Vendor application queue and review
- Document preview
- Radius approval and map review
- Correction, rejection, approval, suspension, and reactivation
- Customer management
- Vendor management
- Order list, order detail, timeline, payment, assignment, and OTP audit
- Exception queue and stuck-status override
- Categories and garment types
- Notification templates and test sends
- Reports, GMV, performance, and activity
- Roles, permissions, audit logs, loading, empty, and failure states

## Assets That Should Be Code-Native

These should not be AI-generated:

- Navigation and action icons
- Search, filter, sort, share, favourite, phone, calendar, payment, and accessibility symbols
- Status timeline nodes and progress lines
- Charts, tables, badges, chips, skeletons, toasts, and form controls
- Razorpay payment-method artwork supplied by the payment SDK
- Google Maps UI and navigation supplied by Google Maps
- Dynamic vendor logos, shop photographs, customer photos, and uploaded documents

Use Material Symbols or platform-native symbols for standard actions. Continue using the proprietary LNDRY icon family only for laundry services and genuinely brand-specific concepts.

## Deployment and Release Coverage

- Android adaptive foreground and background layers
- Android monochrome themed icon
- Android notification small icon
- iOS 1024 px App Store icon master
- Launch and splash treatment
- Admin-dashboard favicon and web-app icons
- Google Play feature graphic and six store screenshots — complete
- Six Apple App Store 6.9-inch screenshots — complete
- Resolution-aware Flutter raster derivatives
- WebP delivery versions of large 3D assets
- Low-bandwidth and failed-image fallbacks

## Visual Storytelling Recommendation

Do not generate an illustration for every screen. The premium story should concentrate on:

- Onboarding and home relief
- Vendor application and approval
- Pickup handover
- Care processing
- Quality confirmation and packaging
- Delivery completion

Operational screens should rely on clear status language, precise UI, and the existing careline motif. Excess illustration would make the marketplace slower and less trustworthy.

## Build Readiness

| Scope | Readiness |
| --- | --- |
| Customer app visual shell | Complete |
| Customer happy-path booking | Complete |
| Customer exception and handover states | Complete |
| Customer P1 production | 14-screen family complete and visually reviewed |
| Vendor app | 19-screen family complete and visually reviewed |
| Delivery employee app | 14-screen family complete and visually reviewed |
| Admin dashboard | 17-screen family complete and visually reviewed |
| App-store and deployment package | Complete |

## Implementation Handoff Order

1. Implement the shared tokens, careline motif, and code-native control system.
2. Build Customer P0/P1 workflows against the supplied mockups and backend state matrix.
3. Build Vendor, Delivery Employee, and Admin surfaces from their deterministic source specifications.
4. Wire the supplied Flutter resolution variants, WebP assets, and low-bandwidth fallbacks.
5. Replace store-listing compositions only if implemented production screens materially change.

## Source Basis

- LNDRY Phase 1 API Contract and Endpoint Catalogue
- LNDRY Phase 1 Platform Requirements and Technical Annexure
- LNDRY Phase 1 Complete Client Workflow
- Approved LNDRY UI sheet and V2 design system
- Flutter asset and resolution guidance
- Android adaptive, monochrome, and notification icon guidance
- Apple app-icon guidance
- Google Play store-listing asset requirements
- Razorpay Flutter integration and payment-state guidance
- Google Maps URL guidance for external navigation
