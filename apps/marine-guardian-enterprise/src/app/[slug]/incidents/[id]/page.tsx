"use client";

import type { JSX } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";

export default function IncidentDetailPage(): JSX.Element {
  const params = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const { slug, id } = params;

  const { data: incidents, isLoading } = trpc.incident.list.useQuery({ limit: 100 });
  const incident = incidents?.find((i) => i.id === id);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="container mx-auto max-w-4xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          Incident not found
        </div>
      </div>
    );
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusColors: Record<string, string> = {
    REPORTED: "bg-yellow-100 text-yellow-800",
    UNDER_INVESTIGATION: "bg-blue-100 text-blue-800",
    RESOLVED: "bg-green-100 text-green-800",
    DISMISSED: "bg-gray-100 text-gray-800",
  };

  const statusLabels: Record<string, string> = {
    REPORTED: "Reported",
    UNDER_INVESTIGATION: "Under Investigation",
    RESOLVED: "Resolved",
    DISMISSED: "Dismissed",
  };

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/${slug}/incidents`)}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to Incidents
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Incident Details</h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[incident.status]}`}
            >
              {statusLabels[incident.status] || incident.status}
            </span>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500">Violator Name</h3>
              <p className="mt-1 text-slate-900">{incident.violatorName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Violator Info</h3>
              <p className="mt-1 text-slate-900">{incident.violatorInfo ?? "—"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Linked Vessel</h3>
              <p className="mt-1 text-slate-900">
                {incident.vessel
                  ? `${incident.vessel.vesselName} (${incident.vessel.registrationNumber})`
                  : "—"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Gear Used</h3>
              <p className="mt-1 text-slate-900">{incident.gearUsed ?? "—"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Location</h3>
              <p className="mt-1 text-slate-900">
                {incident.latitude && incident.longitude
                  ? `${incident.latitude}, ${incident.longitude}`
                  : "—"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Incident Date</h3>
              <p className="mt-1 text-slate-900">{formatDate(incident.incidentDate)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Reported By</h3>
              <p className="mt-1 text-slate-900">{incident.reportedBy?.name ?? "—"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Created At</h3>
              <p className="mt-1 text-slate-900">{formatDate(incident.createdAt)}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-500">Description</h3>
            <p className="mt-1 text-slate-900">{incident.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
