"use client"

import type { JSX } from "react"
import { useParams, useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"

export default function FisherfolkDetailPage(): JSX.Element {
  const router = useRouter()
  const params = useParams<{ slug: string; id: string }>()
  const { slug, id } = params

  const { data: fisherfolk, isLoading, error } = trpc.fisherfolk.byId.useQuery({ id })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (Boolean(error) || !fisherfolk) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          Fisherfolk not found or you don't have permission to view this record.
        </div>
        <button
          onClick={() => router.push(`/${slug}/fisherfolk`)}
          className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
        >
          Back to Fisherfolk
        </button>
      </div>
    )
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push(`/${slug}/fisherfolk`)}
            className="mb-2 text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back to Fisherfolk
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{fisherfolk.fisherfolkCode}</h1>
          <p className="text-sm text-slate-500">
            {fisherfolk.firstName} {fisherfolk.middleName} {fisherfolk.lastName}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/${slug}/fisherfolk/${id}/edit`)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Personal Information */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Personal Information</h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-slate-500">Full Name</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {fisherfolk.firstName} {fisherfolk.middleName} {fisherfolk.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Sex</dt>
              <dd className="mt-1 text-sm text-slate-900">{fisherfolk.sex}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Date of Birth</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDate(fisherfolk.dateOfBirth)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Barangay</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {fisherfolk.barangay?.name ?? "—"}
              </dd>
            </div>
          </dl>
        </section>

        {/* Contact & Registration */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Contact & Registration</h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-slate-500">Contact Number</dt>
              <dd className="mt-1 text-sm text-slate-900">{fisherfolk.contactNumber ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">RSBSA Number</dt>
              <dd className="mt-1 text-sm text-slate-900">{fisherfolk.rsbsaNumber ?? "—"}</dd>
            </div>
          </dl>
        </section>

        {/* Activity Categories */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Activity Categories</h2>
          {fisherfolk.activityCategories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {fisherfolk.activityCategories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                >
                  {cat.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No activity categories assigned</p>
          )}
        </section>

        {/* Status & Timestamps */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Record Information</h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-slate-500">Status</dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    fisherfolk.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {fisherfolk.isActive ? "Active" : "Inactive"}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Created</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDate(fisherfolk.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDate(fisherfolk.updatedAt)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}
