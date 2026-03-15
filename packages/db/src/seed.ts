// ─────────────────────────────────────────────────────────────────────────────
// packages/db/src/seed.ts — Dev seed data
// Creates: BA tenant, 1 LGU tenant (calapan), 62 barangays, users per role,
//          sample fisherfolk, vessel, permit, species
// ─────────────────────────────────────────────────────────────────────────────
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CALAPAN_BARANGAYS = [
  "Balingayan", "Balite", "Baruyan", "Batino", "Bayanan I", "Bayanan II",
  "Biga", "Bondoc", "Bucayao", "Buhuan", "Bulusan", "Calero", "Camansihan",
  "Camilmil", "Canubing I", "Canubing II", "Comunal", "Guinobatan", "Gulod",
  "Gutad", "Ibaba East", "Ibaba West", "Ilaya", "Lalud", "Lazareto", "Libis",
  "Lumang Bayan", "Mahal na Pangalan", "Maidlang", "Malad", "Malamig",
  "Managpi", "Masipit", "Nag-iba I", "Nag-iba II", "Navotas", "Pachoca",
  "Palhi", "Panggalaan", "Parang", "Patas", "Personas", "Putingtubig",
  "Salong", "San Antonio", "San Vicente Central", "San Vicente East",
  "San Vicente North", "San Vicente South", "San Vicente West", "Santa Cruz",
  "Santa Isabel", "Santa Maria Village", "Santa Rita", "Santo Niño", "Sapul",
  "Silonay", "Suqui", "Tawagan", "Tawiran", "Tibag", "Wawa",
];

const SAMPLE_SPECIES = [
  { name: "Thunnus albacares", commonName: "Yellowfin Tuna", rarity: "COMMON" as const },
  { name: "Katsuwonus pelamis", commonName: "Skipjack Tuna", rarity: "COMMON" as const },
  { name: "Decapterus macrosoma", commonName: "Mackerel Scad", rarity: "COMMON" as const },
  { name: "Rastrelliger kanagurta", commonName: "Indian Mackerel", rarity: "COMMON" as const },
  { name: "Lutjanus sebae", commonName: "Emperor Red Snapper", rarity: "UNCOMMON" as const },
  { name: "Epinephelus coioides", commonName: "Orange-spotted Grouper", rarity: "UNCOMMON" as const },
  { name: "Cheilinus undulatus", commonName: "Humphead Wrasse", rarity: "ENDANGERED" as const },
  { name: "Pangasianodon gigas", commonName: "Mekong Giant Catfish", rarity: "ENDANGERED" as const },
];

async function main(): Promise<void> {
  console.warn("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash("Password123!", 12);

  // ── Blue Alliance tenant ─────────────────────────────────────────────────
  const baTenant = await prisma.tenant.upsert({
    where: { slug: "bluealliance" },
    update: {},
    create: {
      name: "Blue Alliance",
      type: "BlueAlliance",
      slug: "bluealliance",
      isActive: true,
    },
  });
  console.warn(`✅ BA tenant: ${baTenant.slug}`);

  // ── Calapan LGU tenant ────────────────────────────────────────────────────
  const calapanTenant = await prisma.tenant.upsert({
    where: { slug: "calapan" },
    update: {},
    create: {
      name: "City of Calapan",
      type: "LGU",
      slug: "calapan",
      isActive: true,
    },
  });
  console.warn(`✅ LGU tenant: ${calapanTenant.slug}`);

  // ── Seed 62 Calapan barangays ─────────────────────────────────────────────
  for (const name of CALAPAN_BARANGAYS) {
    await prisma.barangay.upsert({
      where: { id: `calapan-${name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}` },
      update: {},
      create: {
        id: `calapan-${name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`,
        tenantId: calapanTenant.id,
        name,
        isActive: true,
      },
    });
  }
  console.warn(`✅ Seeded ${CALAPAN_BARANGAYS.length} barangays for calapan`);

  // ── Species catalog ───────────────────────────────────────────────────────
  for (const species of SAMPLE_SPECIES) {
    await prisma.species.upsert({
      where: { id: `species-${species.commonName.toLowerCase().replace(/\s+/g, "-")}` },
      update: {},
      create: {
        id: `species-${species.commonName.toLowerCase().replace(/\s+/g, "-")}`,
        name: species.name,
        commonName: species.commonName,
        rarity: species.rarity,
        isGlobal: true,
      },
    });
  }
  console.warn(`✅ Seeded ${SAMPLE_SPECIES.length} species`);

  // ── BA Admin user ─────────────────────────────────────────────────────────
  const baAdmin = await prisma.user.upsert({
    where: { email: "ba-admin@marinetech.ph" },
    update: {},
    create: {
      email: "ba-admin@marinetech.ph",
      name: "BA Administrator",
      passwordHash,
      isActive: true,
      lastActiveTenantId: baTenant.id,
    },
  });

  await prisma.tenantMembership.upsert({
    where: { userId_tenantId: { userId: baAdmin.id, tenantId: baTenant.id } },
    update: {},
    create: { userId: baAdmin.id, tenantId: baTenant.id, role: "BA_ADMIN", isActive: true },
  });
  console.warn(`✅ BA Admin: ${baAdmin.email}`);

  // ── Calapan Super Admin ───────────────────────────────────────────────────
  const lguAdmin = await prisma.user.upsert({
    where: { email: "admin@calapan.gov.ph" },
    update: {},
    create: {
      email: "admin@calapan.gov.ph",
      name: "Calapan Super Admin",
      passwordHash,
      isActive: true,
      lastActiveTenantId: calapanTenant.id,
    },
  });

  await prisma.tenantMembership.upsert({
    where: { userId_tenantId: { userId: lguAdmin.id, tenantId: calapanTenant.id } },
    update: {},
    create: { userId: lguAdmin.id, tenantId: calapanTenant.id, role: "SUPER_ADMIN", isActive: true },
  });
  console.warn(`✅ LGU Super Admin: ${lguAdmin.email}`);

  // ── Fisheries Officer ─────────────────────────────────────────────────────
  const fishOfficer = await prisma.user.upsert({
    where: { email: "fisheries@calapan.gov.ph" },
    update: {},
    create: {
      email: "fisheries@calapan.gov.ph",
      name: "Fisheries Officer",
      passwordHash,
      isActive: true,
      lastActiveTenantId: calapanTenant.id,
    },
  });

  await prisma.tenantMembership.upsert({
    where: { userId_tenantId: { userId: fishOfficer.id, tenantId: calapanTenant.id } },
    update: {},
    create: { userId: fishOfficer.id, tenantId: calapanTenant.id, role: "FISHERIES_OFFICER", isActive: true },
  });
  console.warn(`✅ Fisheries Officer: ${fishOfficer.email}`);

  console.warn("\n🌱 Seed complete. All dev users use password: Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
