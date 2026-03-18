"use client";

import type { JSX } from "react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";

export default function PatrolDetailPage(): JSX.Element {
  const params = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const { slug, id } = params;

  const { data: patrols, isLoading } = trpc.patrol.list.useQuery({ limit: 100 });
  const patrol = patrols?.find((p) => p.id === id);

  const complete = trpc.patrol.complete.useMutation({
    onSuccess: () => router.refresh(),
  });

  const [completeForm, setCompleteForm] = useState({
    endTime: "",
    fuelConsumedLiters: "",
    notes: "",
  });
  const [showComplete, setShowComplete] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!patrol) {
    return (
      <div className="container mx-auto max-w-4xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          Patrol not found
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
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };

  const statusLabels: Record<string, string> = {
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    complete.mutate({
      id: patrol.id,
      endTime: completeForm.endTime,
      fuelConsumedLiters: completeForm.fuelConsumedLiters
        ? parseFloat(completeForm.fuelConsumedLiters)
        : undefined,
      notes: completeForm.notes || undefined,
    });
  };

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/${slug}/patrols`)}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to Patrols
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Patrol Details</h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[patrol.status]}`}
            >
              {statusLabels[patrol.status] || patrol.status}
            </span>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500">Vessel</h3>
              <p className="mt-1 text-slate-900">
                {patrol.vessel
                  ? `${patrol.vessel.vesselName} (${patrol.vessel.registrationNumber})`
                  : "—"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Started By</h3>
              <p className="mt-1 text-slate-900">{patrol.startedBy?.name ?? "—"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Start Time</h3>
              <p className="mt-1 text-slate-900">{formatDate(patrol.startTime)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">End Time</h3>
              <p className="mt-1 text-slate-900">{formatDate(patrol.endTime)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Fuel Consumed</h3>
              <p className="mt-1 text-slate-900">
                {patrol.fuelConsumedLiters ? `${patrol.fuelConsumedLiters} L` : "—"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Created At</h3>
              <p className="mt-1 text-slate-900">{formatDate(patrol.createdAt)}</p>
            </div>
          </div>

          {patrol.notes && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-500">Notes</h3>
              <p className="mt-1 text-slate-900">{patrol.notes}</p>
            </div>
          )}
        </div>

        {patrol.status === "IN_PROGRESS" && (
          <div className="border-t border-slate-100 px-6 py-4">
            {!showComplete ? (
              <button
                onClick={() => setShowComplete(true)}
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                Complete Patrol
              </button>
            ) : (
              <form
                onSubmit={handleComplete}
                className="space-y-4 rounded-lg border border-slate-200 p-4"
              >
                <h3 className="font-semibold text-slate-900">Complete Patrol</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      End Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={completeForm.endTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCompleteForm((p) => ({ ...p, endTime: e.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Fuel Consumed (L)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={completeForm.fuelConsumedLiters}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCompleteForm((p) => ({ ...p, fuelConsumedLiters: e.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
                  <textarea
                    value={completeForm.notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setCompleteForm((p) => ({ ...p, notes: e.target.value }))
                    }
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={complete.isPending}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {complete.isPending ? "Completing..." : "Confirm Completion"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowComplete(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
