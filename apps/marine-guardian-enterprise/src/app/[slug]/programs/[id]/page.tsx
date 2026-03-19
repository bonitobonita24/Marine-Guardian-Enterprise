"use client";

import type { JSX } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";

export default function ProgramDetailPage(): JSX.Element {
  const params = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const { slug, id } = params;

  const { data: program, isLoading } = trpc.program.byId.useQuery({ id });

  if (Boolean(isLoading)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="container mx-auto max-w-4xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          Program not found
        </div>
      </div>
    );
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const typeLabels: Record<string, string> = {
    EQUIPMENT_DISTRIBUTION: "Equipment Distribution",
    LIVELIHOOD_SUBSIDY: "Livelihood Subsidy",
    TRAINING: "Training",
  };

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/${slug}/programs`)}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to Programs
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">{program.name}</h1>
          <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            {typeLabels[program.type] ?? program.type}
          </span>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500">Start Date</h3>
              <p className="mt-1 text-slate-900">{formatDate(program.startDate)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">End Date</h3>
              <p className="mt-1 text-slate-900">{formatDate(program.endDate)}</p>
            </div>
          </div>

          {Boolean(program.description) && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-500">Description</h3>
              <p className="mt-1 text-slate-900">{program.description}</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Beneficiaries ({program.beneficiaries.length})
          </h2>
          {program.beneficiaries.length === 0 ? (
            <p className="text-sm text-slate-500">No beneficiaries enrolled yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-slate-500">
                    <th className="pb-2 font-medium">Code</th>
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Barangay</th>
                    <th className="pb-2 font-medium">Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {program.beneficiaries.map((b) => (
                    <tr key={b.id} className="border-b border-slate-50">
                      <td className="py-2">{b.fisherfolk.fisherfolkCode}</td>
                      <td className="py-2">
                        {b.fisherfolk.firstName} {b.fisherfolk.lastName}
                      </td>
                      <td className="py-2">{Boolean(b.fisherfolk.barangay?.name) ? b.fisherfolk.barangay?.name : "—"}</td>
                      <td className="py-2">{formatDate(b.enrolledAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {program.distributions.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-4">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Distribution History ({program.distributions.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-slate-500">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Beneficiary</th>
                    <th className="pb-2 font-medium">Item</th>
                    <th className="pb-2 font-medium">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {program.distributions.map((d) => (
                    <tr key={d.id} className="border-b border-slate-50">
                      <td className="py-2">{formatDate(d.distributionDate)}</td>
                      <td className="py-2">
                        {d.fisherfolk.firstName} {d.fisherfolk.lastName}
                      </td>
                      <td className="py-2">{d.itemGiven}</td>
                      <td className="py-2">{d.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
