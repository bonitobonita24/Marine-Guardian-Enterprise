"use client"

import type { JSX } from "react"
import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { trpc } from "@/trpc/client"

export default function NewCatchReportPage(): JSX.Element {
  const router = useRouter()
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  const { data: fisherfolk } = trpc.fisherfolk.list.useQuery({ isActive: true })
  const { data: vessels } = trpc.vessel.list.useQuery({})

  const create = trpc.catchReport.create.useMutation({
    onSuccess: () => router.push(`/${slug}/catch-reports`),
    onError: (err) => setError(err.message),
  })

  const [form, setForm] = useState({
    fisherfolkId: "",
    catchDate: "",
    catchVolumeKg: "",
    landingLocation: "",
    vesselId: "",
  })
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    create.mutate({
      fisherfolkId: form.fisherfolkId,
      catchDate: form.catchDate,
      catchVolumeKg: parseFloat(form.catchVolumeKg),
      landingLocation: form.landingLocation,
      vesselId: form.vesselId,
    })
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Record Catch Report</h1>
        <p className="mt-1 text-sm text-slate-500">Log a new catch report entry</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-slate-900">Catch Details</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Fisherfolk *</label>
              <select
                required
                value={form.fisherfolkId}
                onChange={(e) => setForm((p) => ({ ...p, fisherfolkId: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Select fisherfolk…</option>
                {(fisherfolk ?? []).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.fisherfolkCode} — {f.firstName} {f.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Catch Date *</label>
              <input
                type="date"
                required
                value={form.catchDate}
                onChange={(e) => setForm((p) => ({ ...p, catchDate: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Volume (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={form.catchVolumeKg}
                onChange={(e) => setForm((p) => ({ ...p, catchVolumeKg: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Landing Location *</label>
              <input
                type="text"
                required
                value={form.landingLocation}
                onChange={(e) => setForm((p) => ({ ...p, landingLocation: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Vessel</label>
              <select
                value={form.vesselId}
                onChange={(e) => setForm((p) => ({ ...p, vesselId: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">No vessel</option>
                {(vessels ?? []).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vesselName} ({v.registrationNumber})
                  </option>
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
            {create.isPending ? "Saving…" : "Save Report"}
          </button>
        </div>
      </form>
    </div>
  )
}
