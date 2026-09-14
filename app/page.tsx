"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Users,
  AlertOctagon,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Cpu,
  Clock,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { Badge, parseStatusBadge } from "@/components/Badge";
import { StatCardSkeleton, TableSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import type { FirestoreUser, FirestoreLog } from "@/lib/types";

export default function DashboardPage() {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [logs, setLogs] = useState<FirestoreLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const [usersRes, logsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/logs"),
      ]);

      const usersData = await usersRes.json();
      const logsData = await logsRes.json();

      if (usersRes.ok && usersData.users) {
        setUsers(usersData.users);
      }
      if (logsRes.ok && logsData.logs) {
        setLogs(logsData.logs);
      }
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      if (!silent) {
        setError("Unable to load data from the server. Check Firestore connection.");
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Live auto-sync interval: refresh statistics & activity every 10 seconds silently
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Map user ID to user object for quick name/avatar lookup
  const userMap = useMemo(() => {
    const map = new Map<number, FirestoreUser>();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }, []);

  // 7 days ago date string
  const sevenDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split("T")[0];
  }, []);

  // Dashboard Stats
  const stats = useMemo(() => {
    let verifiedToday = 0;
    let verifiedThisWeek = 0;
    let failedToday = 0;

    logs.forEach((log) => {
      const logDate = log.timestamp ? log.timestamp.slice(0, 10) : "";
      const isVerified = log.status?.toLowerCase().includes("verified");

      if (logDate === todayStr) {
        if (isVerified) {
          verifiedToday++;
        } else {
          failedToday++;
        }
      }

      if (logDate >= sevenDaysAgoStr && logDate <= todayStr && isVerified) {
        verifiedThisWeek++;
      }
    });

    return {
      verifiedToday,
      verifiedThisWeek,
      totalUsers: users.length,
      failedToday,
    };
  }, [logs, users, todayStr, sevenDaysAgoStr]);

  // 7-day Chart Data
  const chartDays = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

      const count = logs.filter(
        (l) =>
          l.timestamp?.slice(0, 10) === dateStr &&
          l.status?.toLowerCase().includes("verified")
      ).length;

      days.push({ date: dateStr, label: dayLabel, count });
    }
    return days;
  }, [logs]);

  const maxChartCount = Math.max(1, ...chartDays.map((d) => d.count));

  // Recent 10 logs
  const recentLogs = useMemo(() => {
    return logs.slice(0, 10);
  }, [logs]);

  return (
    <AppShell
      primaryAction={
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Automatic Live Sync Indicator */}
          <div 
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold select-none shadow-2xs"
            title={`Real-time sync active (polled every 10s). Last synced: ${lastSyncedAt.toLocaleTimeString()}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">Auto-Sync</span>
            <span className="sm:hidden">Live</span>
          </div>

          <button
            onClick={() => fetchData(false)}
            disabled={isLoading}
            className="btn-tactile-secondary inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl"
            title="Instant manual sync"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-brand-blue dark:text-brand-sky" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Error Notification banner if any */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl flex items-center justify-between text-rose-700 dark:text-rose-300 text-sm animate-fadeIn">
            <span>{error}</span>
            <button
              onClick={() => fetchData(false)}
              className="underline font-semibold hover:text-rose-800 dark:hover:text-rose-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* 1. Stat Cards Grid with High Contrast & Tactile Lift */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              {/* Card 1: Verified Today (Green / Emerald State) */}
              <div className="bg-white dark:bg-[#0c1f3d] border-2 border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Verified Today
                  </span>
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl sm:text-4xl font-heading font-extrabold text-[#092B5A] dark:text-white">
                    {stats.verifiedToday}
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Successful authentications
                  </p>
                </div>
              </div>

              {/* Card 2: Verified This Week (Royal Blue Palette Accent) */}
              <div className="bg-white dark:bg-[#0c1f3d] border-2 border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:border-brand-blue/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Verified This Week
                  </span>
                  <div className="w-11 h-11 rounded-2xl bg-blue-100 text-[#1733C0] dark:bg-blue-950/80 dark:text-[#97C6E6] border border-blue-300 dark:border-[#1733C0]/50 flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl sm:text-4xl font-heading font-extrabold text-[#092B5A] dark:text-white">
                    {stats.verifiedThisWeek}
                  </div>
                  <p className="text-xs text-[#1733C0] dark:text-[#97C6E6] mt-2 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1733C0] dark:bg-[#97C6E6]" />
                    Rolling 7-day cumulative
                  </p>
                </div>
              </div>

              {/* Card 3: Total Enrolled Users (Deep Teal Palette Accent) */}
              <div className="bg-white dark:bg-[#0c1f3d] border-2 border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:border-teal-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Total Enrolled Users
                  </span>
                  <div className="w-11 h-11 rounded-2xl bg-teal-100 text-[#0E6F70] dark:bg-teal-950/80 dark:text-teal-300 border border-teal-300 dark:border-teal-500/40 flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl sm:text-4xl font-heading font-extrabold text-[#092B5A] dark:text-white">
                    {stats.totalUsers}
                  </div>
                  <p className="text-xs text-[#0E6F70] dark:text-teal-300 mt-2 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0E6F70]" />
                    Enrolled via Pi only
                  </p>
                </div>
              </div>

              {/* Card 4: Failed Attempts Today (Red / Rose State) */}
              <div className="bg-white dark:bg-[#0c1f3d] border-2 border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:border-rose-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Failed / Unrecognized
                  </span>
                  <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl sm:text-4xl font-heading font-extrabold text-[#092B5A] dark:text-white">
                    {stats.failedToday}
                  </div>
                  <p className="text-xs text-rose-700 dark:text-rose-400 mt-2 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Today&apos;s rejected attempts
                  </p>
                </div>
              </div>
            </>
          )}
        </section>

        {/* 2. 7-Day Trend Chart: Redesigned with Real Filled Gradient Bars & High Contrast */}
        <section className="bg-white dark:bg-[#0c1f3d] border-2 border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-sm transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700/80">
            <div>
              <h2 className="text-lg font-heading font-extrabold text-[#092B5A] dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#1733C0] dark:text-[#97C6E6]" />
                7-Day Verification Activity
              </h2>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                Daily verified check-ins recorded by Raspberry Pi terminal
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-[#1733C0] dark:bg-blue-950/80 dark:text-[#97C6E6] rounded-full border border-blue-300 dark:border-[#1733C0]/50">
                Last 7 Days
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="h-56 w-full bg-slate-100 dark:bg-slate-800/40 rounded-2xl animate-pulse" />
          ) : (
            <div className="pt-2 pb-4">
              <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-6">
                {chartDays.map((day) => {
                  const heightPercent = Math.round((day.count / maxChartCount) * 100);
                  const isToday = day.date === todayStr;
                  const hasData = day.count > 0;

                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Count Badge on Top */}
                      {hasData ? (
                        <span className="text-xs font-extrabold text-[#1733C0] dark:text-[#97C6E6] bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full mb-2 shadow-xs border border-blue-300 dark:border-blue-700/60">
                          {day.count}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2">
                          0
                        </span>
                      )}

                      {/* Bar Track & Fill */}
                      <div className="w-10 sm:w-12 h-36 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-end p-1 group-hover:border-[#1733C0]/40 transition-colors">
                        {hasData ? (
                          <div
                            style={{ height: `${Math.max(16, heightPercent)}%` }}
                            className={`w-full rounded-xl transition-all duration-500 shadow-md ${
                              isToday
                                ? "bg-gradient-to-t from-[#1733C0] to-[#97C6E6] shadow-[#1733C0]/30"
                                : "bg-gradient-to-t from-[#092B5A] to-[#1733C0] dark:from-[#1733C0] dark:to-[#97C6E6]"
                            }`}
                          />
                        ) : (
                          <div className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                        )}
                      </div>

                      {/* Day Name & Date */}
                      <span
                        className={`text-xs mt-2.5 font-bold ${
                          isToday
                            ? "text-[#1733C0] dark:text-[#97C6E6]"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {day.label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {day.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* 3. Recent Activity Table with High Contrast Typography */}
        <section className="bg-white dark:bg-[#0c1f3d] border-2 border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-heading font-extrabold text-[#092B5A] dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1733C0] dark:text-[#97C6E6]" />
                Recent Access Activity
              </h2>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                Latest 10 biometric and RFID events synced from hardware
              </p>
            </div>
            <Link
              href="/logs"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1733C0] dark:text-[#97C6E6] hover:underline transition-colors"
            >
              <span>View All Logs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : recentLogs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CalendarCheck}
                title="No recent attendance logs"
                description="When users scan their RFID card, fingerprint, or face at the Raspberry Pi, access events will appear here in real time."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 dark:bg-[#07152b] text-[#092B5A] dark:text-[#97C6E6] text-xs font-bold border-b-2 border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">User</th>
                    <th className="py-3.5 px-6">Method / Status</th>
                    <th className="py-3.5 px-6">Device</th>
                    <th className="py-3.5 px-6">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {recentLogs.map((log) => {
                    const user = userMap.get(log.user_id);
                    const displayName = user ? user.name : `User #${log.user_id}`;

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={displayName}
                              userId={log.user_id}
                              photoUrl={user?.photo_url}
                              size="sm"
                            />
                            <div>
                              <p className="font-bold text-[#092B5A] dark:text-white">
                                {displayName}
                              </p>
                              <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-medium">
                                ID: #{log.user_id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {parseStatusBadge(log.status)}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono font-semibold">
                            <Cpu className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            {log.device || "Pi_3_Model_B"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-800 dark:text-slate-200 font-mono font-semibold">
                          {log.timestamp}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
