"use client";

import type { JSX } from "react";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { type ProgramType } from "@marine-guardian/shared";

export default function NewProgramPage(): JSX.Element {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const create = trpc.program.create.useMutation({
    onSuccess: () => router.push(`/${slug}/programs`),
    onError: (err: unknown) => setError((err as Error).message),
  });

  const [form, setForm] = useState({
    name: "",
    type: "EQUIPMENT_DISTRIBUTION" as ProgramType,
    description: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    create.mutate({
      name: form.name,
      type: form.type,
      description: form.description || undefined,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
    });
  };

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Create New Program</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create a new government assistance program for fisherfolk
        </p>
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
            Program Information
          </legend>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Program Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g., 2026 Boat Equipment Distribution"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Program Type *
              </label>
              <select
                required
                value={form.type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setForm((p) => ({ ...p, type: e.target.value as ProgramType }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="EQUIPMENT_DISTRIBUTION">Equipment Distribution</option>
                <option value="LIVELIHOOD_SUBSIDY">Livelihood Subsidy</option>
                <option value="TRAINING">Training</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Program description and objectives..."
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-4 text-base font-semibold text-slate-900">Program Period</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Start Date *</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, startDate: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, endDate: e.target.value }))
                }
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
            {create.isPending ? "Creating..." : "Create Program"}
          </button>
        </div>
      </form>
    </div>
  );
}
