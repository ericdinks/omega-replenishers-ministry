"use client";

import { useState, type ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

export function AdminTabs({ tabs }: { tabs: Tab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-navy-100 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveId(tab.id)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              activeId === tab.id
                ? "bg-navy-900 text-white"
                : "text-navy-600 hover:bg-navy-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tabs.map((tab) => (
          <div key={tab.id} hidden={tab.id !== activeId}>
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
