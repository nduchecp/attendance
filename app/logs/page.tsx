"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar,
  Filter,
  RefreshCw,
  Clock,
  Cpu,
  Trash2,
  Edit2,
  CalendarDays,
  CheckCircle,
  Fingerprint,
  ScanFace,
  XCircle,
  AlertCircle,
  Check,
  FileSpreadsheet,
  ArrowUpDown,
} from "lucide-react";
import * as XLSX from "xlsx";
import { MicrosoftExcel } from "@/components/MicrosoftExcel";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { Badge, parseStatusBadge } from "@/components/Badge";
import { Drawer } from "@/components/Drawer";
import { ConfirmModal } from "@/components/ConfirmModal";
import { DownloadModal } from "@/components/DownloadModal";
import { TableSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";
import { useToast } from "@/components/ToastContext";
import type { FirestoreLog, FirestoreUser } from "@/lib/types";

type DateRangePreset = "today" | "week" | "month" | "custom";
type StatusTab = "all" | "verified" | "fingerprint" | "face" | "failed";

export default function LogsPage() {
  const { success, error: toastError } = useToast();

  const [logs, setLogs] = useState<FirestoreLog[]>([]);
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [rangePreset, setRangePreset] = useState<DateRangePreset>("week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusTab>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Drawers & Modals
  const [selectedLog, setSelectedLog] = useState<FirestoreLog | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<FirestoreLog | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadFilename, setDownloadFilename] = useState("");
  const [downloadWorkbook, setDownloadWorkbook] = useState<XLSX.WorkBook | null>(null);

  // Edit log form state
  const [editStatus, setEditStatus] = useState("");
  const [editTimestamp, setEditTimestamp] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Compute date strings based on preset
  const { fromDate, toDate } = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    if (rangePreset === "today") {
      return { fromDate: todayStr, toDate: todayStr };
    }

    if (rangePreset === "week") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return { fromDate: d.toISOString().split("T")[0], toDate: todayStr };
    }

    if (rangePreset === "month") {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return { fromDate: d.toISOString().split("T")[0], toDate: todayStr };
    }

    // Custom
    return { fromDate: customFrom, toDate: customTo };
  }, [rangePreset, customFrom, customTo]);

  // Fetch users for resolving user_id
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      }
    } catch {
      // Quiet fail or toast
    }
  }, []);

  // Fetch logs with query parameters
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);

      if (statusFilter === "verified") {
        params.set("status", "Verified");
      } else if (statusFilter === "fingerprint") {
        params.set("status", "Fingerprint");
      } else if (statusFilter === "face") {
        params.set("status", "Face");
      } else if (statusFilter === "failed") {
        // We will fetch and filter or pass failed
      }

      const res = await fetch(`/api/logs?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.logs) {
        let result = data.logs as FirestoreLog[];
        if (statusFilter === "failed") {
          result = result.filter(
            (l) => !l.status.toLowerCase().includes("verified")
          );
        }
        setLogs(result);
      } else {
        toastError(data.error || "Failed to fetch attendance logs");
      }
    } catch {
      toastError("Network error: Could not retrieve attendance logs.");
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate, statusFilter, toastError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchLogs();
    setCurrentPage(1);
  }, [fetchLogs]);

  // Lookup map for user_id -> user
  const userMap = useMemo(() => {
    const map = new Map<number, FirestoreUser>();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  // Open log detail drawer
  const handleOpenDetail = (log: FirestoreLog) => {
    setSelectedLog(log);
    setEditStatus(log.status);
    setEditTimestamp(log.timestamp);
    setIsDetailDrawerOpen(true);
  };

  // Update log (PATCH /api/logs/:id)
  const handleUpdateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/logs/${selectedLog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus.trim(),
          timestamp: editTimestamp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "Failed to update attendance log");
        return;
      }

      success("Attendance log updated successfully");
      setIsDetailDrawerOpen(false);
      fetchLogs();
    } catch {
      toastError("Failed to update log. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Prompt delete modal
  const handlePromptDelete = (log: FirestoreLog, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLogToDelete(log);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete (DELETE /api/logs/:id)
  const handleConfirmDelete = async () => {
    if (!logToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/logs/${logToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        toastError(data.error || "Failed to delete log");
        return;
      }

      success("Attendance log record deleted");
      setIsDeleteModalOpen(false);
      if (selectedLog?.id === logToDelete.id) {
        setIsDetailDrawerOpen(false);
      }
      setLogToDelete(null);
      fetchLogs();
    } catch {
      toastError("Failed to delete log. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Export filtered logs to native Excel (.xlsx)
  const exportToExcel = () => {
    if (logs.length === 0) {
      toastError("No attendance records to export in the selected range.");
      return;
    }

    // Sort chronologically ascending: Log ID 1 starts the first row, followed by 2, 3... progressively
    const sortedForExport = [...logs].sort((a, b) => {
      if (a.id !== b.id) return a.id - b.id;
      return a.timestamp.localeCompare(b.timestamp);
    });

    const data = sortedForExport.map((log) => {
      const user = userMap.get(log.user_id);
      const userName = user ? user.name : `User #${log.user_id}`;
      const rfid = user ? user.rfid_uid : "N/A";

      // Classify verification medium
      let medium = "Other / Unknown";
      const statusLower = log.status.toLowerCase();
      if (statusLower.includes("fingerprint")) {
        medium = "Fingerprint";
      } else if (statusLower.includes("face")) {
        medium = "Face";
      } else if (statusLower.includes("rfid") || statusLower.includes("card")) {
        medium = "RFID Card";
      } else if (statusLower.includes("verified")) {
        medium = "Biometric (Verified)";
      }

      return {
        "Log ID": log.id,
        "User ID": log.user_id,
        "User Name": userName,
        "RFID UID": rfid,
        "Timestamp": log.timestamp,
        "Verification Medium": medium,
        "Raw Status": log.status,
        "Hardware Device": log.device || "Pi_3_Model_B",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Logs");

    // Auto-fit column widths
    worksheet["!cols"] = [
      { wch: 10 }, // Log ID
      { wch: 10 }, // User ID
      { wch: 24 }, // User Name
      { wch: 18 }, // RFID UID
      { wch: 24 }, // Timestamp
      { wch: 22 }, // Verification Medium
      { wch: 26 }, // Raw Status
      { wch: 18 }, // Device
    ];

    const today = new Date().toISOString().split("T")[0];
    let exportSeq = "01";
    try {
      const stored = localStorage.getItem("nexusattend_excel_counter");
      const nextNum = stored ? parseInt(stored, 10) + 1 : 1;
      localStorage.setItem("nexusattend_excel_counter", String(nextNum));
      exportSeq = String(nextNum).padStart(2, "0");
    } catch {
      exportSeq = String(Date.now()).slice(-4);
    }

    const filename = `attendance_logs_${rangePreset}_${statusFilter}_${today}_#${exportSeq}.xlsx`;
    setDownloadFilename(filename);
    setDownloadWorkbook(workbook);
    setIsDownloadModalOpen(true);
  };

  const handleExecuteDownload = () => {
    if (downloadWorkbook && downloadFilename) {
      XLSX.writeFile(downloadWorkbook, downloadFilename);
    }
  };

  // Sorted logs for display
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.id !== b.id ? a.id - b.id : a.timestamp.localeCompare(b.timestamp);
      }
      return a.id !== b.id ? b.id - a.id : b.timestamp.localeCompare(a.timestamp);
    });
  }, [logs, sortOrder]);

  // Paginated logs
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedLogs.slice(start, start + itemsPerPage);
  }, [sortedLogs, currentPage, itemsPerPage]);

  return (
    <AppShell
      primaryAction={
        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          {/* Export Excel (.xlsx) with official Microsoft Excel icon & tactile green styling */}
          <button
            onClick={exportToExcel}
            disabled={isLoading || logs.length === 0}
            className="btn-tactile-excel flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl disabled:opacity-40 disabled:pointer-events-none shadow-sm cursor-pointer"
            title="Download formatted Excel (.xlsx) spreadsheet with unique sequential ID"
          >
            <MicrosoftExcel className="w-4 h-4 shrink-0 drop-shadow-xs" />
            <span>Export Excel<span className="hidden sm:inline"> (.xlsx)</span></span>
          </button>

          {/* Refresh */}
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="btn-tactile-secondary inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-brand-teal dark:text-brand-sky" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Top Filter Bar */}
        <div className="bg-white dark:bg-[#0c1f3d] border-2 border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 sm:p-5 shadow-sm space-y-3.5 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:gap-4 transition-colors">
          {/* Segmented Control for Date Presets */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-bold text-[#092B5A] dark:text-slate-200 flex items-center gap-1.5 shrink-0">
              <CalendarDays className="w-4 h-4 text-[#1733C0] dark:text-[#97C6E6]" />
              Timeframe:
            </span>
            <div className="inline-flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-700 overflow-x-auto max-w-full">
              {(
                [
                  { id: "today", label: "Today" },
                  { id: "week", label: "This Week" },
                  { id: "month", label: "This Month" },
                  { id: "custom", label: "Custom" },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setRangePreset(preset.id)}
                  className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    rangePreset === preset.id
                      ? "bg-[#1733C0] text-white shadow-md shadow-[#1733C0]/30"
                      : "text-slate-700 dark:text-slate-300 hover:text-[#092B5A] dark:hover:text-white"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Date Range Inputs if Custom preset is active */}
            {rangePreset === "custom" && (
              <div className="flex items-center gap-2 mt-2 sm:mt-0 animate-fadeIn">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-brand-blue"
                  placeholder="From"
                />
                <span className="text-slate-600 dark:text-slate-400 text-xs font-bold">to</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-brand-blue"
                  placeholder="To"
                />
              </div>
            )}
          </div>

          {/* Status Tabs / Filter & Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 lg:pt-0 border-t border-slate-200 dark:border-slate-700 lg:border-t-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              <span className="text-xs font-bold text-[#092B5A] dark:text-slate-200 mr-1 flex items-center gap-1.5 shrink-0">
                <Filter className="w-4 h-4 text-[#1733C0] dark:text-[#97C6E6]" />
                Method:
              </span>
              {(
                [
                  { id: "all", label: "All" },
                  { id: "verified", label: "Verified" },
                  { id: "fingerprint", label: "Fingerprint" },
                  { id: "face", label: "Face" },
                  { id: "failed", label: "Failed" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap shrink-0 ${
                    statusFilter === tab.id
                      ? "bg-blue-100 text-[#1733C0] border-blue-300 dark:bg-blue-950/80 dark:text-[#97C6E6] dark:border-[#1733C0]/60 shadow-xs"
                      : "bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Order Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-brand-blue shadow-xs shrink-0 self-start sm:self-auto"
              title="Toggle sorting order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#1733C0] dark:text-[#97C6E6]" />
              <span>{sortOrder === "asc" ? "Ascending (#1 first)" : "Descending (Newest first)"}</span>
            </button>
          </div>
        </div>

        {/* Logs Table / Cards Container */}
        <div className="bg-white dark:bg-[#0c1f3d] border-2 border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden transition-colors">
          {isLoading ? (
            <TableSkeleton rows={8} />
          ) : logs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CalendarDays}
                title="No attendance logs found"
                description={
                  fromDate || toDate
                    ? `No verification activity recorded between ${fromDate || "beginning"} and ${toDate || "today"}.`
                    : "No attendance events match the active filters. Try broadening the date range."
                }
                actionLabel="Reset to This Week"
                onAction={() => {
                  setRangePreset("week");
                  setStatusFilter("all");
                }}
              />
            </div>
          ) : (
            <>
              {/* Mobile Card List View (Phones & Small Devices) */}
              <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-800">
                {paginatedLogs.map((log) => {
                  const user = userMap.get(log.user_id);
                  const displayName = user ? user.name : `User #${log.user_id}`;

                  return (
                    <div
                      key={log.id}
                      onClick={() => handleOpenDetail(log)}
                      className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800 transition-colors cursor-pointer space-y-2.5"
                    >
                      {/* Top Row: User Avatar, Name, UID, and Action Buttons */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar
                            name={displayName}
                            userId={log.user_id}
                            photoUrl={user?.photo_url}
                            size="md"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-[#092B5A] dark:text-white truncate">
                              {displayName}
                            </p>
                            <p className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                              Log #{log.id} • UID #{log.user_id}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleOpenDetail(log)}
                            className="p-1.5 text-slate-600 hover:text-[#1733C0] dark:text-slate-400 dark:hover:text-[#97C6E6] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                            title="Edit Log"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handlePromptDelete(log, e)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                            title="Delete Log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row: Status Badge, Device, and Timestamp */}
                      <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <div>{parseStatusBadge(log.status)}</div>
                        <div className="flex items-center gap-2.5 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Cpu className="w-3.5 h-3.5 text-slate-400" />
                            {log.device || "Pi_3_Model_B"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {log.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop / Tablet Full Table View */}
              <div className="hidden md:block overflow-x-auto w-full">
                <table className="w-full text-left text-sm table-sticky-header min-w-[640px]">
                  <thead className="bg-slate-100 dark:bg-[#07152b] text-[#092B5A] dark:text-[#97C6E6] text-xs font-bold border-b-2 border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-6">User</th>
                      <th className="py-4 px-6">Verification Method / Status</th>
                      <th className="py-4 px-6">Hardware Device</th>
                      <th className="py-4 px-6">Timestamp</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {paginatedLogs.map((log) => {
                      const user = userMap.get(log.user_id);
                      const displayName = user ? user.name : `User #${log.user_id}`;

                      return (
                        <tr
                          key={log.id}
                          onClick={() => handleOpenDetail(log)}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                        >
                          {/* Resolved User */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={displayName}
                                userId={log.user_id}
                                photoUrl={user?.photo_url}
                                size="md"
                              />
                              <div>
                                <p className="font-bold text-[#092B5A] dark:text-white group-hover:text-[#1733C0] dark:group-hover:text-[#97C6E6] transition-colors text-sm">
                                  {displayName}
                                </p>
                                <p className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
                                  UID: #{log.user_id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-6">
                            {parseStatusBadge(log.status)}
                          </td>

                          {/* Device */}
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                              <Cpu className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                              {log.device || "Pi_3_Model_B"}
                            </span>
                          </td>

                          {/* Timestamp */}
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                              {log.timestamp}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div
                              className="inline-flex items-center gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleOpenDetail(log)}
                                className="p-2 text-slate-600 hover:text-[#1733C0] dark:text-slate-400 dark:hover:text-[#97C6E6] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                title="Edit Log"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handlePromptDelete(log, e)}
                                className="p-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                title="Delete Log"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={logs.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* Log Detail & Edit Drawer */}
      <Drawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        title="Attendance Event Details"
        subtitle={selectedLog ? `Record #${selectedLog.id}` : undefined}
        footer={
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (selectedLog) handlePromptDelete(selectedLog);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Log</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDetailDrawerOpen(false)}
                className="btn-tactile-secondary px-4 py-2 text-xs font-medium rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="log-edit-form"
                disabled={isUpdating}
                className="btn-tactile-primary px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                {isUpdating && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>Save Correction</span>
              </button>
            </div>
          </div>
        }
      >
        {selectedLog && (
          <div className="space-y-6">
            {/* User identification section */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <Avatar
                name={
                  userMap.get(selectedLog.user_id)?.name ||
                  `User #${selectedLog.user_id}`
                }
                userId={selectedLog.user_id}
                photoUrl={userMap.get(selectedLog.user_id)?.photo_url}
                size="lg"
              />
              <div>
                <h3 className="text-lg font-heading font-bold text-brand-navy dark:text-white">
                  {userMap.get(selectedLog.user_id)?.name ||
                    `User #${selectedLog.user_id}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  User ID: {selectedLog.user_id}
                </p>
                <div className="mt-2">
                  {parseStatusBadge(selectedLog.status)}
                </div>
              </div>
            </div>

            {/* Read-only Hardware context */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  Device Hardware
                </span>
                <span className="font-mono text-xs text-brand-navy dark:text-slate-200 font-semibold">
                  {selectedLog.device || "Pi_3_Model_B"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  Log Record ID
                </span>
                <span className="font-mono text-xs text-brand-navy dark:text-slate-200 font-semibold">
                  #{selectedLog.id}
                </span>
              </div>
            </div>

            {/* Correction Form */}
            <form id="log-edit-form" onSubmit={handleUpdateLog} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status Description (Editable)
                </label>
                <input
                  type="text"
                  required
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  placeholder="e.g. Verified (Fingerprint) or Verified (Face)"
                  className="w-full bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditStatus("Verified (Fingerprint)")}
                    className="text-[11px] px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-500/30"
                  >
                    Fingerprint
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus("Verified (Face)")}
                    className="text-[11px] px-2.5 py-1 bg-brand-blue/10 dark:bg-brand-blue/20 hover:bg-brand-blue/20 text-brand-blue dark:text-brand-sky rounded-lg border border-brand-blue/30"
                  >
                    Face
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus("Failed / Unrecognized")}
                    className="text-[11px] px-2.5 py-1 bg-rose-50 dark:bg-rose-500/15 hover:bg-rose-100 text-rose-700 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-500/30"
                  >
                    Failed
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Timestamp (YYYY-MM-DD HH:MM:SS)
                </label>
                <input
                  type="text"
                  required
                  value={editTimestamp}
                  onChange={(e) => setEditTimestamp(e.target.value)}
                  placeholder="2026-09-14 09:30:00"
                  className="w-full bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Manual corrections update the Firestore attendance log only.
                Pi local SQLite history is not modified.
              </div>
            </form>
          </div>
        )}
      </Drawer>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Attendance Log?"
        message={`Are you sure you want to delete the log record #${logToDelete?.id} from ${logToDelete?.timestamp}? This cannot be undone.`}
        confirmLabel="Yes, Delete Log"
        cancelLabel="Cancel"
        isDestructive={true}
      />

      {/* Animated Excel Download Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        filename={downloadFilename}
        recordCount={logs.length}
        onExecuteDownload={handleExecuteDownload}
      />
    </AppShell>
  );
}
