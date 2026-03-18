"use client"

import type { JSX } from "react"
import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { trpc } from "@/trpc/client"
import { VesselType } from "@marine-guardian/shared"

export default function NewVesselPage(): JSX.Element {
  const router = useRouter()
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  const { data: fisherfolk } = trpc.fisherfolk.list.useQuery({ isActive: true })
  const { data: barangays } = trpc.barangay.list.useQuery()

  const create = trpc.vessel.create.useMutation({
    onSuccess: () => router.push(`/${slug}/vessels`),
    onError: (err) => setError(err.message),
  })

  const [form, setForm] = useState({
    vesselName: "",
    registrationNumber: "",
    type: "MOTORIZED" as VesselType,
    lengthMeters: "",
    tonnage: "",
    gearType: "",
    ownerId: "",
    homePortBarangayId: "",
  })
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    create.mutate({
      vesselName: form.vesselName,
      registrationNumber: form.registrationNumber,
      type: form.type,
      lengthMeters: form.lengthMeters ? parseFloat(form.lengthMeters) : undefined,
      tonnage: form.tonnage ? parseFloat(form.tonnage) : undefined,
      gearType: form.gearType || undefined,
      ownerId: form.ownerId,
      homePortBarangayId: form.homePortBarangayId,
    })
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Register Vessel</h1>
        <p className="mt-1 text-sm text-slate-500">Add a new vessel to the registry</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-slate-900">Vessel Information</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Vessel Name *</label>
              <input
                type="text"
                required
                value={form.vesselName}
                onChange={(e) => setForm((p) => ({ ...p, vesselName: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Registration Number *</label>
              <input
                type="text"
                required
                value={form.registrationNumber}
                onChange={(e) => setForm((p) => ({ ...p, registrationNumber: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Type *</label>
              <select
                required
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as VesselType }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="MOTORIZED">Motorized</option>
                <option value="NON_MOTORIZED">Non-Motorized</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Length (meters)</label>
              <input
                type="number"
                step="0.1"
                value={form.lengthMeters}
                onChange={(e) => setForm((p) => ({ ...p, lengthMeters: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tonnage (GT)</label>
              <input
                type="number"
                step="0.1"
                value={form.tonnage}
                onChange={(e) => setForm((p) => ({ ...p, tonnage: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Gear Type</label>
              <input
                type="text"
                value={form.gearType}
                onChange={(e) => setForm((p) => ({ ...p, gearType: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-4 text-base font-semibold text-slate-900">Owner & Port</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Owner *</label>
              <select
                required
                value={form.ownerId}
                onChange={(e) => setForm((p) => ({ ...p, ownerId: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Select owner…</option>
                {(fisherfolk ?? []).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.fisherfolkCode} — {f.firstName} {f.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Home Port Barangay *</label>
              <select
                required
                value={form.homePortBarangayId}
                onChange={(e) => setForm((p) => ({ ...p, homePortBarangayId: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Select barangay…</option>
                {barangays?.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
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
            {create.isPending ? "Registering…" : "Register Vessel"}
          </button>
        </div>
      </form>
    </div>
  )
}
