"use client"

import type { JSX } from "react"
import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { trpc } from "@/trpc/client"
import { Sex } from "@marine-guardian/shared"

export default function NewFisherfolkPage(): JSX.Element {
  const router = useRouter()
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  const { data: barangays } = trpc.barangay.list.useQuery()

  const create = trpc.fisherfolk.create.useMutation({
    onSuccess: () => router.push(`/${slug}/fisherfolk`),
    onError: (err) => setError(err.message),
  })

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    sex: "MALE" as "MALE" | "FEMALE",
    barangayId: "",
    contactNumber: "",
    rsbsaNumber: "",
    activityCategories: [] as string[],
  })
  const [error, setError] = useState("")

  const activityOptions = [
    "BOAT_OWNER_OPERATOR",
    "CAPTURE_FISHING",
    "GLEANING",
    "VENDOR",
    "FISH_PROCESSING",
    "AQUACULTURE",
  ]

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      activityCategories: prev.activityCategories.includes(cat)
        ? prev.activityCategories.filter((c) => c !== cat)
        : [...prev.activityCategories, cat],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    create.mutate({
      ...form,
      sex: form.sex as Sex,
      activityCategories: form.activityCategories as never[],
    })
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Register Fisherfolk</h1>
        <p className="mt-1 text-sm text-slate-500">Add a new fisherfolk to the registry</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Personal Info */}
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-slate-900">Personal Information</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">First Name *</label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Middle Name</label>
              <input
                type="text"
                value={form.middleName}
                onChange={(e) => setForm((p) => ({ ...p, middleName: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Last Name *</label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Date of Birth *</label>
              <input
                type="date"
                required
                value={form.dateOfBirth}
                onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Sex *</label>
              <select
                required
                value={form.sex}
                onChange={(e) => setForm((p) => ({ ...p, sex: e.target.value as "MALE" | "FEMALE" }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Barangay *</label>
              <select
                required
                value={form.barangayId}
                onChange={(e) => setForm((p) => ({ ...p, barangayId: e.target.value }))}
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

        {/* Contact */}
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-slate-900">Contact & Registration</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Contact Number</label>
              <input
                type="tel"
                value={form.contactNumber}
                onChange={(e) => setForm((p) => ({ ...p, contactNumber: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">RSBSA Number</label>
              <input
                type="text"
                value={form.rsbsaNumber}
                onChange={(e) => setForm((p) => ({ ...p, rsbsaNumber: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        </fieldset>

        {/* Activity Categories */}
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-slate-900">Activity Categories</legend>
          <div className="flex flex-wrap gap-2">
            {activityOptions.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  form.activityCategories.includes(cat)
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 text-slate-600 hover:border-blue-200"
                }`}
              >
                {cat.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Actions */}
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
            {create.isPending ? "Registering…" : "Register Fisherfolk"}
          </button>
        </div>
      </form>
    </div>
  )
}
