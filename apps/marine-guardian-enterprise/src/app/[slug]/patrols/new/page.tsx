"use client";

import type { JSX } from "react";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { trpc } from "@/trpc/client";

export default function NewPatrolPage(): JSX.Element {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: vessels } = trpc.vessel.list.useQuery();

  const create = trpc.patrol.create.useMutation({
    onSuccess: () => router.push(`/${slug}/patrols`),
    onError: (err: unknown) => setError((err as Error).message),
  });

  const [form, setForm] = useState({
    vesselId: "",
    startTime: "",
    notes: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    create.mutate({
      vesselId: form.vesselId,
      startTime: form.startTime,
      notes: form.notes || undefined,
    });
  };

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Start New Patrol</h1>
        <p className="mt-1 text-sm text-slate-500">Record the start of a new patrol mission</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-slate-900">Patrol Details</legend>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Patrol Vessel *
              </label>
              <select
                required
                value={form.vesselId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setForm((p) => ({ ...p, vesselId: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Select vessel…</option>
                {(vessels ?? []).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vesselName} ({v.registrationNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Start Time *</label>
              <input
                type="datetime-local"
                required
                value={form.startTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, startTime: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Any initial notes about this patrol..."
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        </fieldset>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={create.isPending}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {create.isPending ? "Starting..." : "Start Patrol"}
          </button>
        </div>
      </form>
    </div>
  );
}
