# Product Definition
# ⚠️ THIS IS THE ONLY FILE YOU EDIT AS A HUMAN.
# Agents own everything else. To change anything — edit this file, then run Phase 7.
# V11: Wrap sensitive content in <private>...</private> to prevent agent propagation.

## App Name
Marine Guardian Enterprise

Repository: marine-guardian-enterprise

## Connected Apps

- **Marine Guardian Enterprise Web** — Main management dashboard for LGU and BA
  users (Next.js, port 3000). BlueSentinel incident monitoring is a module within
  this web app.
- **BlueSentinel Mobile** — Field patrol companion app for LGU Patrollers and BA
  Rangers (Expo / React Native, iOS + Android).
  - Offline-first: yes — incidents, patrols, GPS routes, evidence photos
  - Push notifications: yes — incident alerts, status changes, permit decisions
    (provider: Expo Push Service)
  - Deployment: App Store + Play Store

## Purpose
Marine Guardian Enterprise is a multi-tenant digital platform that enables Local
Government Units (LGUs) to centrally manage fisherfolk registrations, fishing
vessels, permits, catch monitoring, government fisheries programs, and marine
enforcement activities. It replaces paper-based and spreadsheet records with a
structured, analytics-ready system accessible through each LGU's own isolated
workspace. A higher-level governing body, Blue Alliance (BA), operates its own
independent patrol and enforcement workspace and has access to a Consolidated
Cross-LGU Dashboard providing aggregated analytics and enforcement oversight
across all participating LGUs.

## Target Users

- **LGU Super Admin** — Full access within their assigned LGU. Manages users, LGU
  settings, and all modules. Cannot access other LGUs' data.
- **LGU Fisheries Officer** — Registers fisherfolk and vessels, processes permits,
  records catch data, creates and manages programs and beneficiaries.
- **LGU Encoder** — Data entry only. Can create and edit fisherfolk and vessel
  records but cannot approve permits or manage programs.
- **LGU Viewer** — Read-only access to all records, dashboards, and reports within
  their LGU. Cannot create or modify any data.
- **LGU Patroller** — Uses the BlueSentinel mobile app in coastal and sea patrols.
  Records incidents in the field, operates offline-first, receives live alerts
  when connected.
- **BA Admin (Blue Alliance)** — Full access to the Blue Alliance workspace. Manages
  BA users, oversees BA Rangers' patrol operations, views the BA Operational
  Dashboard (BA-own data only), and views the Consolidated Cross-LGU Dashboard
  (BA + all LGU data combined). Can drill down into individual LGU records.
- **BA Analyst (Blue Alliance)** — Read-only access to the BA Operational Dashboard
  and the Consolidated Cross-LGU Dashboard. Cannot manage users or modify any data.
- **BA Ranger (Blue Alliance)** — Uses the BlueSentinel web interface and mobile app
  for BA-level patrolling. Creates and submits incident reports scoped to the BA
  tenant only. Receives live alerts. Operates offline-first. Cannot access the
  Consolidated Cross-LGU Dashboard.

## Core Entities

- **Tenant** (id, name, type [LGU | BlueAlliance], slug, logoUrl, isActive,
  createdAt, updatedAt)
  The `slug` field (e.g. "calapan", "bluealliance") is the URL path prefix used
  to identify and isolate each tenant's workspace. Lowercase, alphanumeric,
  assigned at provisioning, immutable after creation.
- **User** (id, email, name, passwordHash, isActive, createdAt, updatedAt)
  A single user account can belong to multiple tenants with different roles via
  TenantMembership. The role field is NOT on User — it lives on TenantMembership.
- **TenantMembership** (id, userId [→ User], tenantId [→ Tenant], role [SUPER_ADMIN
  | FISHERIES_OFFICER | ENCODER | VIEWER | PATROLLER | BA_ADMIN | BA_ANALYST |
  BA_RANGER], isActive, createdAt, updatedAt)
  Unique constraint on (userId, tenantId). User selects tenant after login or is
  routed automatically via URL path slug.
- **Barangay** (id, tenantId [→ Tenant], name, isActive, createdAt)
  Per-tenant lookup table seeded on tenant creation. City of Calapan default seed
  (62 barangays): Balingayan, Balite, Baruyan, Batino, Bayanan I, Bayanan II, Biga,
  Bondoc, Bucayao, Buhuan, Bulusan, Calero, Camansihan, Camilmil, Canubing I,
  Canubing II, Comunal, Guinobatan, Gulod, Gutad, Ibaba East, Ibaba West, Ilaya,
  Lalud, Lazareto, Libis, Lumang Bayan, Mahal na Pangalan, Maidlang, Malad,
  Malamig, Managpi, Masipit, Nag-iba I, Nag-iba II, Navotas, Pachoca, Palhi,
  Panggalaan, Parang, Patas, Personas, Putingtubig, Salong, San Antonio,
  San Vicente Central, San Vicente East, San Vicente North, San Vicente South,
  San Vicente West, Santa Cruz, Santa Isabel, Santa Maria Village, Santa Rita,
  Santo Niño, Sapul, Silonay, Suqui, Tawagan, Tawiran, Tibag, Wawa.
- **Species** (id, name, commonName, rarity [COMMON | UNCOMMON | RARE | ENDANGERED],
  isGlobal, createdAt, updatedAt)
  Global catalog shared across all tenants. Used for structured catch reporting
  and rare/endangered species anomaly detection.
- **Fisherfolk** (id, tenantId, fisherfolkCode [unique per LGU — format:
  {SLUG_PREFIX}-{6-digit-zero-padded-sequence}, e.g. CALA-000123; prefix is the
  first 4 characters of the tenant slug uppercased, sequence auto-increments per
  tenant], firstName,
  middleName, lastName, dateOfBirth, sex, barangayId [→ Barangay], contactNumber,
  rsbsaNumber, activityCategories [BOAT_OWNER_OPERATOR | CAPTURE_FISHING | GLEANING
  | VENDOR | FISH_PROCESSING | AQUACULTURE], photoUrl, signatureUrl, isActive,
  createdAt, updatedAt)
- **Vessel** (id, tenantId, ownerId [→ Fisherfolk], vesselName, registrationNumber,
  type [MOTORIZED | NON_MOTORIZED], lengthMeters, tonnage, gearType,
  homePortBarangayId [→ Barangay], isActive, createdAt, updatedAt)
- **Permit** (id, tenantId, vesselId [→ Vessel], type [FISHING_VESSEL |
  COMMERCIAL_FISHING], status [DRAFT | SUBMITTED | UNDER_REVIEW | APPROVED |
  REJECTED | EXPIRED], issuedAt, expiresAt, approvedById [→ User], rejectionNotes,
  documentUrl, createdAt, updatedAt)
- **CatchReport** (id, tenantId, vesselId [→ Vessel], fisherfolkId [→ Fisherfolk],
  speciesId [→ Species], speciesFreeText [fallback if species not in catalog],
  catchVolumeKg, catchDate, landingLocation, notes, createdAt)
- **Program** (id, tenantId, name, type [EQUIPMENT_DISTRIBUTION | LIVELIHOOD_SUBSIDY
  | TRAINING], description, startDate, endDate, createdAt, updatedAt)
- **ProgramBeneficiary** (id, programId [→ Program], fisherfolkId [→ Fisherfolk],
  enrolledAt)
- **DistributionEvent** (id, programId [→ Program], fisherfolkId [→ Fisherfolk],
  itemGiven, quantity, distributionDate, notes, createdAt)
- **Incident** (id, tenantId, reportedById [→ User], violatorName, violatorInfo,
  vesselId [→ Vessel, nullable], gearUsed, latitude, longitude, incidentDate,
  description, evidenceUrls [], status [REPORTED | UNDER_INVESTIGATION | RESOLVED |
  DISMISSED], createdAt, updatedAt)
  LGU incidents belong to the LGU tenant. BA Ranger incidents belong to the BA
  tenant only and are never cross-tagged to an LGU.
- **Patrol** (id, tenantId [→ Tenant], vesselId [→ Vessel], startedById [→ User],
  startTime, endTime, fuelConsumedLiters, routeGeoJson [nullable], notes,
  status [IN_PROGRESS | COMPLETED | CANCELLED], createdAt, updatedAt)
  Tracks seaborne patrol missions by LGU Patrollers and BA Rangers. Used for fuel
  consumption analytics and patrol coverage reporting.
- **Notification** (id, userId [→ User], type, title, body,
  channel [EMAIL | IN_APP], isRead, sentAt, createdAt)
- **AuditLog** (id, tenantId [→ Tenant, nullable], userId [→ User], action,
  entityType, entityId, metadata [JSON], ipAddress, createdAt)
  Immutable. Cannot be deleted by any user role including admins. Records all
  system events: login, failed login, CRUD operations, role changes, permit status
  changes, incident status changes, tenant provisioning.
- **PushToken** (id, userId [→ User], token, platform [ios | android],
  createdAt, updatedAt)
  Expo Push Token per user per device. Multiple tokens per user supported.
  Upserted on mobile login. Deleted on logout or on Expo DeviceNotRegistered error.
- **RefreshToken** (id, userId [→ User], tokenHash, platform [ios | android],
  expiresAt, createdAt)
  Long-lived refresh token for BlueSentinel mobile auth. Stored as a hashed value
  only. Rotated on each use (sliding 30-day expiry). Deleted on logout. Used
  exclusively by the mobile /api/auth/mobile/refresh endpoint.

## User Roles

- **SUPER_ADMIN** — scope: LGU tenant. Full access within their LGU only. Manage
  LGU users, settings, all modules, approve/reject permits, view all reports and
  dashboards. Cannot access any other LGU's data.
- **FISHERIES_OFFICER** — scope: LGU tenant. Register fisherfolk, register vessels,
  submit and review permit applications, record catch reports, create programs,
  enroll beneficiaries, record distribution events. Cannot manage users or settings.
- **ENCODER** — scope: LGU tenant. Create and edit fisherfolk and vessel records
  only. Cannot approve permits, manage programs, or manage users.
- **VIEWER** — scope: LGU tenant. Read-only access to all records, dashboards, and
  reports. Cannot call any mutation procedure.
- **PATROLLER** — scope: LGU tenant. BlueSentinel mobile app only. Create and submit
  incident reports. Receive live push alerts. Operates offline-first. No access to
  web management modules.
- **BA_ADMIN** — scope: BA tenant. Full access to BA workspace. Manage BA users
  (Analyst, Ranger), oversee BA Ranger patrols and incidents, view BA Operational
  Dashboard, view Consolidated Cross-LGU Dashboard. Drill down into individual LGU
  data within the Consolidated Dashboard. Cannot modify LGU-level records directly.
- **BA_ANALYST** — scope: BA tenant. Read-only. View BA Operational Dashboard and
  Consolidated Cross-LGU Dashboard. Cannot call any mutation procedure. No access
  to BlueSentinel patrol or incident functions.
- **BA_RANGER** — scope: BA tenant. BlueSentinel web and mobile app for BA-level
  patrol operations only. Create and submit incidents scoped to BA tenant only.
  Incidents never tagged to any LGU. Receive BA-tenant live alerts. Operate
  offline-first. No access to Consolidated Cross-LGU Dashboard or LGU-level data.

## Main Workflows (step-by-step)

### Workflow: Fisherfolk Registration
1. Fisheries Officer or Encoder navigates to the Fisherfolk Management module.
2. Clicks "Register New Fisherfolk."
3. Fills in: first name, middle name, last name, date of birth, sex, barangay,
   contact number, RSBSA number (optional).
4. Selects one or more activity categories.
5. Uploads or captures a photo (file upload or live camera capture). System
   auto-optimizes and stores the image via background job.
6. Uploads or captures a signature (file upload or stylus input). System
   auto-optimizes and stores the image via background job.
7. Submits the form. System assigns a unique fisherfolk code.
8. Record appears in the fisherfolk registry, immediately available for linking
   to vessels, permits, and programs.
9. Edge case — duplicate RSBSA: if RSBSA number already exists in the tenant,
   system warns the user before saving. User must confirm or cancel.
10. Edge case — upload failure: if photo or signature upload fails, form remains
    open and user is prompted to retry before submitting.

### Workflow: Fisherfolk ID Card Generation
1. Staff opens a fisherfolk's profile page and clicks "Generate ID Card."
2. System opens ID card designer pre-populated with: photo, full name, RSBSA
   number, activity category, LGU logo, and a QR code linking to the profile.
3. Layout is editable — staff can reposition elements, change fonts, update logo.
4. Card displayed as front and back side by side in a single row.
5. Staff clicks "Export / Print."
6. System generates a PDF at 200×300mm portrait containing both sides.
7. PDF downloaded for printing.
8. Edge case — missing photo or signature: system warns staff before export.
   Card can still be exported with a placeholder if staff confirms.

### Workflow: Vessel Registration
1. Fisheries Officer navigates to Vessel Management and clicks "Register New Vessel."
2. Searches for and selects vessel owner from fisherfolk registry. Owner must be a
   registered fisherfolk within the same LGU.
3. Fills in: vessel name, registration number, type (motorized/non-motorized),
   length, tonnage, gear type, home port barangay.
4. Submits. Vessel record created and linked to owner fisherfolk.
5. Edge case — inactive fisherfolk: system blocks registration and prompts staff
   to verify the fisherfolk record first.

### Workflow: Permit Application and Approval
1. Fisheries Officer navigates to a vessel record and clicks "Apply for Permit."
2. Selects permit type: Fishing Vessel Permit or Commercial Fishing Permit.
3. Fills in required details. Saves as Draft or submits immediately.
4. On submit, status transitions to Submitted.
5. LGU Super Admin or Fisheries Officer reviews. Status moves to Under Review.
6. Reviewer either Approves or Rejects:
   - Approved: PermitPdfGeneration job triggered. PDF stored, status set to
     Approved, issuedAt and expiresAt recorded. In-app and email notification
     sent to submitting staff.
   - Rejected: status set to Rejected, rejection notes recorded. In-app and
     email notification sent to submitting staff.
7. Daily PermitExpiryCheck job transitions Approved permits to Expired when
   expiresAt date has passed.
8. Edge case — duplicate active permit: system warns user if vessel already has
   an active permit of the same type before allowing a new application.

### Workflow: Catch and Fish Landing Recording
1. Fisheries Officer navigates to Catch Monitoring and clicks "Record Catch Report."
2. Selects vessel. Linked fisherfolk auto-populated from vessel ownership.
3. Selects species from global catalog, or enters free text if not listed.
   Free-text entries are flagged for catalog review.
4. Enters: catch volume (kg), catch date, landing location, optional notes.
5. Submits. Record saved and immediately reflected in LGU dashboard catch charts
   via real-time SSE update (`dashboard.lguEvents`).
6. Edge case — rare/endangered species: system triggers anomaly alert to BA
   Analysts and LGU Super Admin.

### Workflow: Patrol Logging
1. Patroller (LGU) or Ranger (BA) starts a patrol via BlueSentinel mobile app
   or BlueSentinel web module.
2. Selects a patrol vessel from the registry.
3. System records start time. GPS tracking begins on mobile (Expo Location
   background task, 30-second interval) or manual route entry on web.
4. During patrol, user can create incident reports linked to this patrol.
   Each incident auto-captures current GPS coordinates.
5. At patrol end, user enters fuel consumed (liters) and optional notes, then
   marks patrol as completed.
6. Full route (array of [lon, lat, timestamp] tuples) sent to server as
   Patrol.routeGeoJson (JSONB). Patrol detail screen shows route on map.
7. Fuel consumption feeds BA Consolidated Dashboard anomaly detection.
8. Edge case — GPS denied: app falls back to manual location entry,
   routeGeoJson stored as null.
9. Edge case — app crash mid-patrol: patrol remains IN_PROGRESS. User can
   resume or manually mark as cancelled with a note.

### Workflow: Program Creation and Beneficiary Enrollment
1. LGU Super Admin or Fisheries Officer navigates to Programs and clicks
   "Create New Program."
2. Fills in: name, type (equipment distribution, livelihood subsidy, training),
   description, start date, end date. Saves program.
3. Opens program record and clicks "Enroll Beneficiaries."
4. Searches and selects fisherfolk from registry. Confirms enrollment.
   In-app notification sent to relevant staff.
5. Enrolled beneficiaries listed on the program detail page.
6. Edge case — duplicate enrollment: system blocks adding a fisherfolk already
   enrolled in the same program.

### Workflow: Distribution Event Recording
1. Staff opens a program record and clicks "Record Distribution Event."
2. Selects beneficiary from the program's enrolled fisherfolk list.
3. Enters: item given, quantity, distribution date, optional notes.
4. Submits. Record saved and linked to both the program and the fisherfolk.
5. Distribution history visible on program detail page and fisherfolk profile.

### Workflow: Tenant Provisioning (BA Admin)
1. BA Admin logs into marine-guardian-enterprise.powerbyte.app/bluealliance.
2. Navigates to Tenant Management (BA_ADMIN only) and clicks "Provision New LGU."
3. Fills in: LGU name, path slug (e.g. `calapan`), display name, optional logo URL.
   Slug must be lowercase, alphanumeric, no spaces. Immutable after creation.
4. Submits. System:
   a. Creates new Tenant record with type LGU.
   b. Seeds Barangay table with City of Calapan 62-barangay dataset (default) or
      a custom list if provided.
   c. Writes tenant_provisioning AuditLog entry.
   d. Returns new tenant's path-based URL and setup link.
5. BA Admin can optionally create the first SUPER_ADMIN user for the new LGU
   from the same screen.
6. Edge case — slug taken: if path slug already exists (case-insensitive), system
   rejects with a clear error.

### Workflow: GPS Patrol Tracking (Mobile)
1. Patroller or Ranger starts a patrol from BlueSentinel mobile app and selects
   a vessel. App requests GPS permission if not already granted.
2. App begins recording GPS at 30-second intervals via Expo Location background
   task. Live route line drawn on in-app map (react-native-maps).
3. Incidents created during patrol auto-capture current GPS coordinates.
4. At patrol end, full route array sent to server as Patrol.routeGeoJson.
5. Patrol detail screen on mobile and web shows the route on a map.
6. Edge case — GPS denied: falls back to manual location entry, routeGeoJson null.

### Workflow: Evidence Photo Capture (Mobile — Incident Reporting)
1. Patroller fills in an incident report and taps "Add Evidence."
2. App presents: Camera or Gallery. Up to 5 photos (JPEG, max 10 MB each).
3. App compresses each photo to ≤2 MB using Expo ImageManipulator.
4. If online: app requests presigned PUT URLs from server and uploads directly
   to incidents storage bucket. URLs stored in Incident.evidenceUrls[].
5. If offline: photos saved to WatermelonDB as base64 data URIs. On sync, app
   uploads photos and replaces base64 with server URLs.
6. Web incident detail page shows evidence photos in a gallery grid.
7. Edge case — upload fails mid-sync: failed photos re-queued and retried on
   next sync. Incident saved with partial evidenceUrls until all succeed.

### Workflow: Expo Push Token Registration (Mobile)
1. On first launch after login, app requests push notification permissions.
2. If granted, Expo SDK retrieves the device's Expo Push Token.
3. App calls `pushToken.register` tRPC mutation with token and platform.
4. Server upserts token in PushToken table. One user can have multiple tokens
   (multiple devices).
5. On logout or uninstall, app calls `pushToken.unregister`.
6. Notification Dispatch job reads all push tokens for target user and delivers
   Expo Push notifications to each registered device.
7. Edge case — invalid token: Expo returns DeviceNotRegistered, job automatically
   deletes the stale token.

### Workflow: BlueSentinel Incident Reporting (Mobile, Offline-First)
1. Patroller (LGU) or Ranger (BA) opens BlueSentinel mobile app.
2. Creates new incident: violator name and info, vessel details (optional),
   fishing gear used, GPS location (auto-captured or manual), incident date,
   description. Attaches evidence photos.
3. Saves/submits the report:
   - If online: syncs to server immediately. Status set to Reported. Live alert
     sent to relevant supervisors and Rangers/Patrollers.
   - If offline: saved locally in offline queue. On reconnect, app automatically
     syncs all queued reports to server.
4. Supervisor (LGU Super Admin or BA Admin) reviews and updates status:
   Under Investigation → Resolved or Dismissed.
5. Edge case — duplicate report: if two Rangers report the same vessel at the
   same location and time, system flags potential duplicates for supervisor review.
6. Edge case — sync conflict: server state wins for status fields, device state
   wins for new reports.

### Workflow: LGU Dashboard Monitoring
1. Any LGU user (except Patroller) navigates to the Dashboard.
2. Dashboard loads KPIs in real time via `dashboard.lguEvents` SSE subscription.
3. User can filter by date range or barangay.

### Workflow: BA Operational Dashboard Monitoring
1. BA Admin, BA Analyst, or BA Ranger logs into the Blue Alliance workspace.
2. BA Operational Dashboard loads KPIs scoped to BA tenant data only via
   `dashboard.baOperationalEvents` SSE subscription.
3. BA Admin can manage BA users and settings from this workspace.

### Workflow: Consolidated Cross-LGU Dashboard Monitoring
1. BA Admin or BA Analyst navigates to the Consolidated Dashboard tab within
   the Blue Alliance workspace (separate from BA Operational Dashboard).
2. Consolidated Dashboard loads combined data across BA and all LGU tenants
   via `dashboard.consolidatedEvents` SSE subscription.
3. BA Admin can drill down into individual LGU data breakdowns.
4. BA Analyst has same view but cannot manage users or configuration.
5. BA Ranger does NOT have access to this dashboard.

## Realtime Features

- `dashboard.lguEvents` — SSE subscription per LGU tenant. Emits lightweight
  invalidation event on any tenant mutation. Client re-fetches only changed data.
  Subscribed by all LGU users on the dashboard page.
- `dashboard.baOperationalEvents` — SSE subscription scoped to BA tenant only.
  Emits when BA Rangers submit incidents or complete patrols. Subscribed by
  BA Admin, BA Analyst, and BA Ranger on the BA Operational Dashboard.
- `dashboard.consolidatedEvents` — SSE subscription for cross-tenant data.
  Emits when any LGU or BA data changes. Subscribed by BA Admin and BA Analyst
  only on the Consolidated Dashboard. BA Ranger does not subscribe.
- `bluesentinel.incidentAlerts` — SSE subscription. Delivers real-time incident
  creation and status-update alerts to connected clients. LGU Patrollers receive
  alerts scoped to their tenant only. BA Rangers receive alerts for BA-tenant
  incidents only.
- Mobile offline-first sync via WatermelonDB. On reconnect, all queued data
  syncs automatically. Conflict resolution: server state wins for status fields,
  device state wins for new reports.
- Push notifications via Expo Push Service. Notification Dispatch job delivers
  to all registered device tokens for the target user, even when app is
  backgrounded or closed.

## Background Jobs

BullMQ queue names (one queue per job type for independent scaling):
- `image-optimization` — ImageOptimization job
- `permit-pdf` — PermitPdfGeneration job
- `idcard-pdf` — IdCardPdfGeneration job
- `permit-expiry` — PermitExpiryCheck job
- `notification-dispatch` — NotificationDispatch job
- `offline-sync` — OfflineSyncProcessing job
- `evidence-photo` — EvidencePhotoProcessing job
- AuditLogWriter is synchronous inline — no queue.

DLQ replay UI: yes — a basic DLQ management panel is included in the web admin
for SUPER_ADMIN (per-tenant) and BA_ADMIN (platform-wide). Displays failed jobs
with error details, allows retry or dismiss per job. This is required because
failed permit PDFs, offline sync failures, and evidence photo processing failures
have real operational consequences for field staff who cannot access the DB directly.

- ImageOptimization | triggered on fisherfolk photo/signature upload | compresses
  and resizes to optimized format before storing | retry 3x exponential backoff |
  DLQ after 3 failures — original preserved, staff notified to re-upload.

- PermitPdfGeneration | triggered on permit approval | renders official permit PDF,
  stores it, attaches URL to permit record | retry 3x exponential | DLQ after 3
  failures — permit status remains Approved, staff notified to manually regenerate.

- IdCardPdfGeneration | triggered on demand when staff clicks "Export / Print" on
  the ID card designer | synchronous — PDF generated in-request, browser download
  starts immediately (single PDF, sub-second generation, no queue needed) |
  no retry — on failure, staff sees an error toast and can retry from the same page.

- PermitExpiryCheck | runs daily at midnight | scans all Approved permits;
  transitions any permit with expiresAt in the past to Expired | retries full job
  on failure | results logged to AuditLog.

- NotificationDispatch | triggered by permit approval/rejection, program enrollment
  confirmation, and incident alerts | sends in-app notification immediately, queues
  email via email provider, sends Expo Push to all registered device tokens for
  target user | retry 3x per channel | DLQ — in-app always succeeds; email and
  push failures are logged but non-blocking.

- OfflineSyncProcessing | triggered when BlueSentinel mobile clients upload queued
  reports on reconnect | validates and saves each report; fires alert notifications |
  retry 3x per report | DLQ — failed reports flagged for manual review by supervisor.

- AuditLogWriter | triggered synchronously inline on every key mutation (login,
  failed login, all CRUD, role changes, permit status changes, incident status
  changes, tenant provisioning) | writes immutable AuditLog record before the
  parent transaction commits | no async retry — if audit write fails, the parent
  transaction rolls back. Cannot be disabled by any role.

- EvidencePhotoProcessing | triggered when BlueSentinel mobile uploads incident
  evidence photos | compresses and stores each image in incidents bucket under
  incident ID; appends URLs to Incident.evidenceUrls | retry 3x | DLQ — failed
  photos re-queued on next sync; incident saved with partial URLs until all succeed.

## File Uploads

- Fisherfolk photos
  - Allowed types: JPEG, PNG
  - Max size: 10 MB before compression
  - Store original: no — optimized version only
  - Image variants: single optimized version (compressed and resized)
  - Storage path: [tenantSlug]/fisherfolk/[fisherfolkId]/photo.[ext]

- Fisherfolk signatures
  - Allowed types: PNG
  - Max size: 5 MB before compression
  - Store original: no — optimized version only
  - Image variants: single optimized version
  - Storage path: [tenantSlug]/fisherfolk/[fisherfolkId]/signature.png

- Permit documents
  - Type: PDF (system-generated on approval, not user-uploaded)
  - Storage path: [tenantSlug]/permits/[permitId]/permit.pdf

- ID card exports
  - Type: PDF (system-generated on demand)
  - Storage path: [tenantSlug]/idcards/[fisherfolkId]/idcard.pdf
  - Lifecycle: temporary or retained per tenant preference

- Incident evidence photos
  - Allowed types: JPEG
  - Max per incident: 5 photos
  - Max size: 10 MB each before compression; compressed to ≤2 MB before upload
  - Store original: no — compressed version only
  - Offline fallback: base64 data URI stored in WatermelonDB until sync
  - Upload method: presigned PUT URL (one per photo, requested from server)
  - Storage path: [tenantSlug]/incidents/[incidentId]/evidence-[n].jpg

- GPS patrol routes
  - Not a file upload — stored as JSONB in Patrol.routeGeoJson column
  - Format: array of [longitude, latitude, timestamp] tuples
  - Captured at 30-second intervals by Expo Location background task

## Reporting & Dashboards

### LGU Operational Dashboard
- Total registered fisherfolk: count card + trend over time (line chart)
- Fisherfolk by barangay: bar chart
- Fisherfolk by activity category: pie/donut chart
- Total registered vessels: count card
- Permit status breakdown: status cards + bar chart
  (Draft / Submitted / Under Review / Approved / Rejected / Expired)
- Monthly catch volume trend: line chart, filterable by species or date range
- Active programs and enrollment counts: count cards
- Filters: date range, barangay
- Export: none (dashboard view only)

### BA Operational Dashboard
Scoped to BA tenant data only. Visible to BA Admin, BA Analyst, BA Ranger.
- Total BA Ranger patrols by status: count cards (active / completed / cancelled)
- BA incidents by status: count cards + bar chart
- BA patrol fuel consumption trend: line chart
- BA incident map: GPS-plotted markers by incident status
- BA Ranger activity summary: table (patrols per ranger, incidents per ranger)
- Real-time active patrol status: live list of in-progress patrols
- Export: none (dashboard view only)

### Consolidated Cross-LGU Dashboard
Visible to BA Admin and BA Analyst only. BA Ranger does NOT have access.
- Total fisherfolk across all LGUs: aggregate count + per-LGU breakdown (bar chart)
- Total vessels across all LGUs: aggregate count
- Permit statistics by LGU: grouped bar chart (approved / pending / expired)
- Regional catch volume trends: line chart, filterable by LGU or date range
- Incident overview — BA + all LGUs combined:
  - Count by status (bar chart)
  - Count by source — BA vs each LGU (stacked bar chart)
  - Recent incidents list (table)
- Patrol overview — BA + all LGUs combined: fuel consumption trend (line chart)
- Anomaly flags panel:
  - LGUs with >50% drop in catch reporting vs prior month
  - Unusual patrol fuel consumption (deviation from fleet average)
  - Rare or endangered species in catch reports
  - Incident spikes per LGU vs historical baseline
- Drill-down: BA Admin can click any LGU to view its individual data breakdown
- Export: none (dashboard view only)

### Module Table Exports
CSV export is in scope for two module tables only (operational need for BFAR
reporting). All other tables are view-only in this build.
- Fisherfolk registry table: CSV export — all columns, filtered by current search/
  filter state, scoped to the active tenant. Available to SUPER_ADMIN and
  FISHERIES_OFFICER only.
- Permit list table: CSV export — all columns including status and dates, filtered
  by current filter state, scoped to the active tenant. Available to SUPER_ADMIN
  and FISHERIES_OFFICER only.
- Vessels, catch reports, programs, incidents: no export in this build.

## Mobile App

- Platform: iOS + Android
- Framework: Expo managed
- Distribution: App Store + Play Store
- Offline-first: yes
  - Incidents: create, edit, and queue for sync while offline
  - Patrols: start, log GPS route, and complete while offline
  - Evidence photos: captured and stored as base64 offline; uploaded on reconnect
  - Sync strategy: WatermelonDB local SQLite; conflict resolution favors server
    state for status fields, device state for new reports
- Push notifications: yes
  - Triggers: new incident alerts, incident status changes, permit decisions
  - Provider: Expo Push Service via Notification Dispatch background job
  - Token registration: on first launch after login; upserted to PushToken table
  - Token cleanup: on logout or Expo DeviceNotRegistered error
- Native features: camera, GPS, biometrics
  - Camera: Expo Camera + ImageManipulator (up to 5 photos per incident,
    compressed to ≤2 MB client-side before upload)
  - GPS: Expo Location background task (30-second interval during active patrol)
  - Maps: react-native-maps (live patrol route display on-device)
  - Biometrics: Expo LocalAuthentication — fingerprint and face unlock for app
    re-access after screen lock. Does not replace the login session.
- Deep linking: no
- Mobile auth: separate long-lived token flow (Auth.js cookies not suitable for
  React Native). Access token: short-lived JWT (15 min) stored in Expo SecureStore.
  Refresh token: long-lived opaque token (30 days) stored in Expo SecureStore and
  server-side in RefreshToken table (userId, tokenHash, expiresAt, platform,
  createdAt) for revocation. Tokens rotate on each use (sliding expiry). Mobile
  passes access token as Bearer header; web uses Auth.js session cookie. Same
  tRPC procedures serve both.

## User-Facing URLs

Routing is subdirectory-based, NOT subdomain-based. The tenant slug is always
the first path segment. No wildcard DNS or wildcard SSL required — a single
certificate for marine-guardian-enterprise.powerbyte.app covers all tenants.

Multi-tenant — subdirectory routing:
- LGU workspace:  https://marine-guardian-enterprise.powerbyte.app/[lgu-slug]/...
  Example:        https://marine-guardian-enterprise.powerbyte.app/calapan/dashboard
- BA workspace:   https://marine-guardian-enterprise.powerbyte.app/bluealliance/...
- Dev (LGU):      http://localhost:3000/[lgu-slug]/...
- Dev (BA):       http://localhost:3000/bluealliance/...
- Mobile API:     same backend; tenant slug passed as path param in tRPC calls
                  (/trpc/[slug]/router); stored in mobile app local state after login

## Access Control

Public routes (no login required):
- /login
- /forgot-password
- /reset-password

Protected routes (login required — all authenticated users):
- /[slug]/dashboard
- /[slug]/fisherfolk
- /[slug]/vessels
- /[slug]/permits
- /[slug]/catch
- /[slug]/programs
- /[slug]/bluesentinel
- /[slug]/settings

Role-restricted routes:
- /[slug]/settings/users — SUPER_ADMIN and BA_ADMIN only
- /[slug]/settings/tenant — SUPER_ADMIN and BA_ADMIN only
- /[slug]/permits/approve — SUPER_ADMIN and FISHERIES_OFFICER only
- /bluealliance/consolidated — BA_ADMIN and BA_ANALYST only (BA_RANGER denied)
- /bluealliance/tenants — BA_ADMIN only

Tenant boundary enforcement: all /[slug]/... routes verify the authenticated user
has an active TenantMembership for the slug in the URL. Mismatched slug returns
403. Enforced in Next.js middleware before any page renders.

Multi-tenant login UX: on successful login, user is auto-routed to their most
recently used tenant (stored as a session preference). If no prior session exists,
user is routed to their only tenant, or to a /select-tenant page if they have
multiple active memberships. A tenant switcher is available in the nav header at
all times, allowing switch without re-login — JWT is re-issued for the selected
tenant on switch.

Navigation menus: hardcoded with role-based visibility baked into code — not
stored in a database table. Role boundaries are fixed for this government system
and do not require admin configuration.

## Data Sensitivity

- PII collected: full name, date of birth, sex, home barangay, contact number,
  RSBSA number, fisherfolk photo, handwritten signature.
- Sensitivity level: High. Government identity records for individuals in coastal
  communities.
- Tenant isolation: all PII strictly scoped to its originating tenant at two
  levels — (1) application-level tenantId filtering in every tRPC query, and
  (2) PostgreSQL RLS at the database layer as a safety net. No LGU can access
  another LGU's fisherfolk data even if application logic has a bug.
- Blue Alliance access: BA Admin and BA Analyst access only aggregated, non-PII
  analytics via the Consolidated Dashboard. Individual fisherfolk PII is never
  surfaced at the BA level.
- Retention policy: to be defined per LGU in coordination with local governance
  rules. System supports per-tenant data retention configuration.
- Compliance: Philippine Data Privacy Act (RA 10173). Photos and signatures
  processed only for official government identification purposes.
- Audit log scope: login, failed login, all CRUD mutations, role changes, permit
  status changes, incident status changes, tenant provisioning. Immutable — no
  user role can delete or modify AuditLog records.

## Security Requirements

Always active for all roles:
- RBAC: role-based access control enforced on every tRPC procedure via middleware
  before any resolver runs. Unauthorized calls return 403 FORBIDDEN. (L3 — always active)
- AuditLog: immutable record written synchronously on every data mutation before
  the transaction commits. Cannot be disabled by any role. (L5 — always active)
- Query guardrails: Prisma middleware auto-injects tenantId on every tenant-scoped
  query. Missing tenantId throws a hard error before query reaches the DB. (L6 — always active)

Multi-tenant isolation layers:
- Tenant context: tenantId extracted from resolved URL slug and attached to JWT
  session context on every request. (L1)
- PostgreSQL RLS: enabled on all tenant-scoped tables. Runtime role `mg_app` has
  RLS enforced (NOT superuser, NO BYPASSRLS). Migration role `mg_migrate` has
  BYPASSRLS and is never used at runtime. SET LOCAL app.current_tenant_id
  injected at the start of every transaction. (L2)
  Tables with RLS: Barangay, Fisherfolk, Vessel, Permit, CatchReport, Program,
  ProgramBeneficiary, DistributionEvent, Incident, Patrol, AuditLog.
  Tables exempt (no tenantId): Tenant, User, TenantMembership, Species,
  Notification, PushToken — protected by application-level logic only.
- Connection pool limits: PgBouncer in transaction mode. Per-tenant limit: 10
  connections. BA cross-tenant analytics pool: 5 connections. Total ceiling
  enforced to prevent connection exhaustion. (L4)

Rate limiting:
- Public endpoints (login, forgot-password, reset-password): 20 requests/minute per IP
- Authenticated endpoints: 300 requests/minute per user
- Upload endpoints: 10 uploads/minute per user
- Mobile sync endpoints: 60 requests/minute per device

CORS allowed origins (H1):
- dev:   http://localhost:3000 and exp:// (Expo dev client, dev only)
- stage: https://stage.marine-guardian-enterprise.powerbyte.app
- prod:  https://marine-guardian-enterprise.powerbyte.app
No additional origins. Mobile production traffic uses the same prod origin via
the Expo-built app (not a browser origin).

CSRF protection (H2): SameSite=Lax cookies (Auth.js default). No additional CSRF
tokens needed for same-origin web requests. Mobile uses Bearer token auth and is
not subject to CSRF. Confirm: yes.

JWT session fields: userId, email, activeTenantId, activeTenantSlug,
activeTenantType [LGU | BlueAlliance], role. Resolved from TenantMembership for
the active tenant. When a user belongs to multiple tenants, they select their
active tenant after login and the JWT is re-issued without a full re-login.

## Tenancy Model

multi — subdirectory routing
(e.g. marine-guardian-enterprise.powerbyte.app/[slug]/...)

- Tenant identifier: slug (URL path prefix, lowercase alphanumeric, immutable)
- Tenant types: LGU (isolated operational workspace) and BlueAlliance (independent
  patrol/enforcement workspace + cross-LGU oversight)
- Shared global data outside tenant boundaries:
  - Species catalog (isGlobal = true) — read-only by all tenants for catch reporting
  - Tenant table — read by Next.js middleware for slug resolution only
- Roles are global enum values defined at the platform level. Each TenantMembership
  assigns one role per user per tenant. Roles are not configurable per tenant.
- BA Admin provisions new LGU tenants. LGU staff cannot self-provision.
- Cross-tenant queries: permitted only for BA_ADMIN and BA_ANALYST via Consolidated
  Dashboard resolvers. These aggregate metrics only — raw LGU PII is never returned.

## Environments Needed

- dev — local development. Docker Compose services: postgres + pgbouncer, valkey,
  minio, mailhog, app, worker.
- stage — full production clone for QA and UAT before releases.
- prod — live production. Real LGU data, real users.

## Domain / Base URL Expectations

Dev:   http://localhost:3000
Stage: https://stage.marine-guardian-enterprise.powerbyte.app
Prod:  https://marine-guardian-enterprise.powerbyte.app

## Infrastructure Notes

All services run in Docker Compose for dev and stage. AWS-ready via env var swap
only — no code changes required to move from local to cloud services.

Docker Compose services:
- postgres + pgbouncer (transaction pooling, per-tenant connection limits)
- valkey (cache + BullMQ queue backend)
- minio (local S3-compatible file storage)
- mailhog (local email capture for dev)
- app (Next.js web server, port 3000)
- worker (BullMQ background job processor — standalone Node.js app at apps/worker/
  with its own package.json and src/index.ts; imports queue/job definitions from
  packages/jobs; scales independently from the Next.js app)

Production AWS path:
- RDS PostgreSQL (primary database)
- S3 or Cloudflare R2 (file storage — swap via env var, zero code changes)
- ElastiCache or self-hosted Valkey (queue and cache backend)
- SES (transactional email delivery)
- PgBouncer as RDS sidecar or via RDS Proxy

Mobile (BlueSentinel):
- Expo EAS Build for App Store and Play Store distribution
- Expo Push Service for push notification delivery
- WatermelonDB (local SQLite) for offline-first data storage on device

Monorepo worker structure:
- packages/jobs — queue definitions, job payload types, shared BullMQ config
- apps/worker — standalone Node.js runtime process (entry: src/index.ts);
  imports from packages/jobs; deployed as a separate Docker container

Kubernetes: disabled by default. Placeholder K8s manifests are scaffolded
in /k8s/ for future use but are not wired into any deployment pipeline. All
active deployment targets use Docker Compose (dev/stage) or direct AWS services
(prod). K8s can be activated in a future infrastructure phase.

## Tech Stack Preferences

Frontend framework:        Next.js
API style:                 tRPC
ORM / DB layer:            Prisma + PostgreSQL RLS (runtime role mg_app enforces
                           RLS; migration role mg_migrate has BYPASSRLS and is
                           never used at runtime; RLS policies maintained in
                           /prisma/migrations/apply_rls_policies.sql)
Auth provider:             Auth.js (NextAuth v5)
Primary database:          PostgreSQL
Cache / queue:             Valkey + BullMQ
File storage:              MinIO (dev) / S3 or Cloudflare R2 (prod)
UI component library:      shadcn/ui + Tailwind CSS
Mobile UI library:         React Native Reusables + NativeWind

Project-specific additions (beyond base stack defaults):
Connection pooler:         PgBouncer (transaction mode, per-tenant pool limits)
Realtime transport:        Server-Sent Events (SSE) via tRPC subscriptions
Offline sync (mobile):     WatermelonDB (local SQLite)
Mobile framework:          Expo managed workflow / React Native

## Design Identity

Brand feel:         professional/enterprise
Target aesthetic:   Government-grade platform — clean, structured, data-dense
                    layout optimised for operational staff. Similar feel to
                    enterprise GIS and public-sector dashboards. No decorative
                    elements; clarity and legibility are the primary values.
Industry category:  Government / Public Sector
Dark mode required: optional toggle
Key constraint:     WCAG AA accessibility compliance required — government system
                    used by public servants across varying device quality levels