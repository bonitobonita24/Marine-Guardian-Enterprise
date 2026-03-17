import { auth } from "../../auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@marine-guardian/ui"
import { prisma } from "@marine-guardian/db"

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await auth()
  const { slug } = await params

  if (!session?.user) {
    redirect("/login")
  }

  // Verify user has access to this tenant
  const membership = await prisma.tenantMembership.findFirst({
    where: {
      userId: session.user.id,
      tenant: { slug },
      isActive: true,
    },
    include: { tenant: true },
  })

  if (!membership) {
    redirect("/")
  }

  // Get dashboard stats
  const [
    fisherfolkCount,
    vesselCount,
    permitCount,
    incidentCount,
    recentIncidents,
  ] = await Promise.all([
    prisma.fisherfolk.count({ where: { tenantId: membership.tenantId } }),
    prisma.vessel.count({ where: { tenantId: membership.tenantId } }),
    prisma.permit.count({ where: { tenantId: membership.tenantId } }),
    prisma.incident.count({ where: { tenantId: membership.tenantId } }),
    prisma.incident.findMany({
      where: { tenantId: membership.tenantId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { reportedBy: true },
    }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {membership.tenant.name}
            </h1>
            <p className="text-sm text-gray-500">
              {membership.tenant.type} Dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user.name}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {membership.role}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Fisherfolk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {fisherfolkCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Registered Vessels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {vesselCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Active Permits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {permitCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {incidentCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            {recentIncidents.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent incidents</p>
            ) : (
              <div className="space-y-4">
                {recentIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {incident.violatorName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {incident.description.substring(0, 100)}...
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        incident.status === "REPORTED"
                          ? "bg-yellow-100 text-yellow-800"
                          : incident.status === "RESOLVED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {incident.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
