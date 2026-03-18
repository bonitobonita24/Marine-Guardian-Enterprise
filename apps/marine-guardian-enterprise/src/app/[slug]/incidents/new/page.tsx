"use client";

import type { JSX } from "react";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { trpc } from "@/trpc/client";

export default function NewIncidentPage(): JSX.Element {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: vessels } = trpc.vessel.list.useQuery();

  const create = trpc.incident.create.useMutation({
    onSuccess: () => router.push(`/${slug}/incidents`),
    onError: (err: unknown) => setError((err as Error).message),
  });

  const [form, setForm] = useState({
    violatorName: "",
    violatorInfo: "",
    vesselId: "",
    gearUsed: "",
    latitude: "",
    longitude: "",
    incidentDate: "",
    description: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    create.mutate({
      violatorName: form.violatorName,
      violatorInfo: form.violatorInfo || undefined,
      vesselId: form.vesselId || undefined,
      gearUsed: form.gearUsed || undefined,
      latitude: form.latitude ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      incidentDate: form.incidentDate,
      description: form.description,
    });
  };

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Report New Incident</h1>
        <p className="mt-1 text-sm text-slate-500">Record a new marine incident or violation</p>
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
          <legend className="mb-4 text-base font-semibold text-slate-900">
            Violator Information
          </legend>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Violator Name *
              </label>
              <input
                type="text"
                required
                value={form.violatorName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, violatorName: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Violator Info</label>
              <input
                type="text"
                value={form.violatorInfo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, violatorInfo: e.target.value }))
                }
                placeholder="Additional violator details..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-4 text-base font-semibold text-slate-900">Vessel Details</legend>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Linked Vessel</label>
              <select
                value={form.vesselId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setForm((p) => ({ ...p, vesselId: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">None</option>
                {(vessels ?? []).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vesselName} ({v.registrationNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Gear Used</label>
              <input
                type="text"
                value={form.gearUsed}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, gearUsed: e.target.value }))
                }
                placeholder="e.g., illegal net, dynamite"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-4 text-base font-semibold text-slate-900">Location & Time</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Latitude</label>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, latitude: e.target.value }))
                }
                placeholder="e.g., 13.4333"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Longitude</label>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, longitude: e.target.value }))
                }
                placeholder="e.g., 121.6167"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Incident Date *
              </label>
              <input
                type="datetime-local"
                required
                value={form.incidentDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, incidentDate: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-4 text-base font-semibold text-slate-900">Description</legend>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description *</label>
            <textarea
              required
              value={form.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Describe the incident in detail..."
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
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
            {create.isPending ? "Submitting..." : "Submit Incident"}
          </button>
        </div>
      </form>
    </div>
  );
}
