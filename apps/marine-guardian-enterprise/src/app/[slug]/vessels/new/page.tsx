"use client";

import type { JSX } from "react";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { type VesselType } from "@marine-guardian/shared";

export default function NewVesselPage(): JSX.Element {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: fisherfolk } = trpc.fisherfolk.list.useQuery();

  const create = trpc.vessel.create.useMutation({
    onSuccess: () => router.push(`/${slug}/vessels`),
    onError: (err: unknown) => setError((err as Error).message),
  });

  const [form, setForm] = useState({
    vesselName: "",
    registrationNumber: "",
    type: "MOTORIZED" as VesselType,
    ownerId: "",
    homePortBarangayId: "",
    lengthMeters: "",
    tonnage: "",
    gearType: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.ownerId) {
      setError("Please select an owner");
      return;
    }
    if (!form.homePortBarangayId) {
      setError("Please enter home port barangay name");
      return;
    }
    create.mutate({
      vesselName: form.vesselName,
      registrationNumber: form.registrationNumber,
      type: form.type,
      ownerId: form.ownerId,
      homePortBarangayId: form.homePortBarangayId,
      lengthMeters: form.lengthMeters ? parseFloat(form.lengthMeters) : undefined,
      tonnage: form.tonnage ? parseFloat(form.tonnage) : undefined,
      gearType: form.gearType || undefined,
    });
  };

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Register New Vessel</h1>
        <p className="mt-1 text-sm text-slate-500">Register a new fishing vessel in the system</p>
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
            Vessel Information
          </legend>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Vessel Name *</label>
              <input
                type="text"
                required
                value={form.vesselName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, vesselName: e.target.value }))
                }
                placeholder="e.g., Maria Elena"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Registration Number *
              </label>
              <input
                type="text"
                required
                value={form.registrationNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, registrationNumber: e.target.value }))
                }
                placeholder="e.g., REG-2026-001"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Vessel Type *</label>
              <select
                required
                value={form.type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setForm((p) => ({ ...p, type: e.target.value as VesselType }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="MOTORIZED">Motorized</option>
                <option value="NON_MOTORIZED">Non-Motorized</option>
                <option value="OUTRIGGER">Outrigger (Bangka)</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-4 text-base font-semibold text-slate-900">Ownership</legend>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Owner *</label>
              <select
                required
                value={form.ownerId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setForm((p) => ({ ...p, ownerId: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Select owner...</option>
                {(fisherfolk ?? []).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.firstName} {f.lastName} ({f.fisherfolkCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Home Port Barangay *
              </label>
              <input
                type="text"
                required
                value={form.homePortBarangayId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, homePortBarangayId: e.target.value }))
                }
                placeholder="e.g., Puerto Galera"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-4 text-base font-semibold text-slate-900">Technical Details</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Length (meters)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.lengthMeters}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, lengthMeters: e.target.value }))
                }
                placeholder="e.g., 7.5"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tonnage (GT)</label>
              <input
                type="number"
                step="0.1"
                value={form.tonnage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, tonnage: e.target.value }))
                }
                placeholder="e.g., 3.5"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Gear Type</label>
              <input
                type="text"
                value={form.gearType}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, gearType: e.target.value }))
                }
                placeholder="e.g., Gill net, Hook and line"
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
            {create.isPending ? "Registering..." : "Register Vessel"}
          </button>
        </div>
      </form>
    </div>
  );
}
