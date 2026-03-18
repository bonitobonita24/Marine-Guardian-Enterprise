"use client"

import type { JSX } from "react"
import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { trpc } from "@/trpc/client"
import { PermitType } from "@marine-guardian/shared"

export default function NewPermitPage(): JSX.Element {
  const router = useRouter()
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  const { data: vessels } = trpc.vessel.list.useQuery({})

  const create = trpc.permit.create.useMutation({
    onSuccess: () => router.push(`/${slug}/permits`),
    onError: (err) => setError(err.message),
  })

  const [form, setForm] = useState({
    vesselId: "",
    type: "FISHING_VESSEL" as PermitType,
    expiresAt: "",
  })
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    create.mutate({
      vesselId: form.vesselId,
      type: form.type,
    })
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Issue Permit</h1>
        <p className="mt-1 text-sm text-slate-500">Create a new fishing vessel permit</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-slate-900">Permit Details</legend>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Vessel *</label>
              <select
                required
                value={form.vesselId}
                onChange={(e) => setForm((p) => ({ ...p, vesselId: e.target.value }))}
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
              <label className="mb-1 block text-sm font-medium text-slate-700">Permit Type *</label>
              <select
                required
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as PermitType }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="FISHING_VESSEL">Fishing Vessel</option>
                <option value="COMMERCIAL_FISHING">Commercial Fishing</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Expiration Date *</label>
              <input
                type="date"
                required
                value={form.expiresAt}
                onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
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
            {create.isPending ? "Creating…" : "Issue Permit"}
          </button>
        </div>
      </form>
    </div>
  )
}
