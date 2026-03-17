import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@marine-guardian/db"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (session == null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const tenantSlug = searchParams.get("tenantSlug")

  if (tenantSlug == null || session.user.activeTenantSlug !== tenantSlug) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  })

  if (tenant == null) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
  }

  const fisherfolk = await prisma.fisherfolk.findMany({
    where: { tenantId: tenant.id, isActive: true },
    include: { barangay: true },
    orderBy: { lastName: "asc" },
  })

  const csvHeader = [
    "fisherfolkCode",
    "firstName",
    "middleName",
    "lastName",
    "dateOfBirth",
    "sex",
    "barangay",
    "contactNumber",
    "rsbsaNumber",
    "activityCategories",
  ]

  const csvRows = fisherfolk.map((ff) => [
    ff.fisherfolkCode,
    ff.firstName,
    ff.middleName ?? "",
    ff.lastName,
    ff.dateOfBirth.toISOString().split("T")[0],
    ff.sex,
    ff.barangay?.name ?? "",
    ff.contactNumber ?? "",
    ff.rsbsaNumber ?? "",
    ff.activityCategories.join(";"),
  ])

  const csvContent = [
    csvHeader.join(","),
    ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n")

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="fisherfolk-${tenantSlug}.csv"`,
    },
  })
}
