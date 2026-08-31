"use client";

import { useMemo, useState } from "react";
import { StatusToggle } from "@/components/admin/StatusToggle";
import type { PrayerRequestRow, PrayerRequestStatus } from "@/lib/types/database";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function PrayerRequestsTable({
  requests,
}: {
  requests: PrayerRequestRow[];
}) {
  const [filter, setFilter] = useState<PrayerRequestStatus | "all">("all");

  const filtered = useMemo(
    () =>
      filter === "all" ? requests : requests.filter((r) => r.status === filter),
    [requests, filter]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "answered"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === option
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-navy-200 text-navy-600 hover:border-navy-900"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-navy-100">
        <table className="min-w-full divide-y divide-navy-100 text-sm">
          <thead className="bg-navy-50 text-left text-xs font-semibold uppercase tracking-wide text-navy-500">
            <tr>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Request</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy-400">
                  No prayer requests in this view.
                </td>
              </tr>
            ) : (
              filtered.map((request) => (
                <tr key={request.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-navy-500">
                    {formatDateTime(request.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium text-navy-900">
                    {request.full_name}
                  </td>
                  <td className="px-4 py-3 text-navy-500">{request.email}</td>
                  <td className="max-w-md px-4 py-3 text-navy-700">
                    {request.request}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        request.is_public
                          ? "bg-blue-100 text-blue-700"
                          : "bg-navy-100 text-navy-600"
                      }`}
                    >
                      {request.is_public ? "Public OK" : "Private"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusToggle id={request.id} status={request.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
