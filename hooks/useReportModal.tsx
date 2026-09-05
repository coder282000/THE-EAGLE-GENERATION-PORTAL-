"use client";

import { useState } from "react";
import { ReportModal as ReportModalComponent, ReportData } from "@/components/modals/reportModal";

export function useReportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const openReport = (data: ReportData) => {
    setReportData(data);
    setIsOpen(true);
  };

  const closeReport = () => {
    setIsOpen(false);
    setTimeout(() => setReportData(null), 300);
  };

  function ReportModal() {
    if (!reportData) return null;
    return (
      <ReportModalComponent
        isOpen={isOpen}
        onClose={closeReport}
        data={reportData}
      />
    );
  }

  return {
    isOpen,
    reportData,
    openReport,
    closeReport,
    ReportModal,
  };
}