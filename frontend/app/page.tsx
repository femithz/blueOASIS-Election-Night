"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageSection } from "@/components/layout/PageSection";
import { ViewTabs, type ViewTabId } from "@/components/layout/ViewTabs";
import { ConstituencyList } from "@/components/constituency/ConstituencyList";
import { ParliamentSeatsChart } from "@/components/parliament/ParliamentSeatsChart";
import { FileUpload } from "@/components/upload/FileUpload";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ViewTabId>("constituencies");

  return (
    <AppShell title="Election Night">
      <div className="mb-6">
        <FileUpload />
      </div>
      <ViewTabs
        active={activeTab}
        onSelect={setActiveTab}
        constituenciesContent={
          <PageSection title="Constituency results">
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              Results by constituency: winning party and vote share.
            </p>
            <ConstituencyList />
          </PageSection>
        }
        parliamentContent={
          <PageSection title="Parliament distribution">
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              Seats and total votes by party across all constituencies.
            </p>
            <ParliamentSeatsChart />
          </PageSection>
        }
      />
    </AppShell>
  );
}
