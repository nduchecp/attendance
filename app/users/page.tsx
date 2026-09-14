"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Fingerprint,
  CreditCard,
  Trash2,
  Edit2,
  RefreshCw,
  Users as UsersIcon,
  Info,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { Drawer } from "@/components/Drawer";
import { ConfirmModal } from "@/components/ConfirmModal";
import { TableSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";
import { useToast } from "@/components/ToastContext";
import type { FirestoreUser } from "@/lib/types";

export default function UsersPage() {
  const { success, error: toastError } = useToast();

  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Drawers & Modals
  const [selectedUser, setSelectedUser] = useState<FirestoreUser | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<FirestoreUser | null>(null);

  // Form states
  const [editName, setEditName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch users with optional search query (supports silent auto-sync)
  const fetchUsers = useCallback(async (search = "", silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const url = search.trim()
        ? `/api/users?search=${encodeURIComponent(search.trim())}`
        : "/api/users";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
        setLastSyncedAt(new Date());
      } else if (!silent) {
        toastError(data.error || "Failed to load users");
      }
    } catch {
      if (!silent) {
        toastError("Network error: Could not retrieve users.");
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [toastError]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(searchQuery, false);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchUsers]);

  // Auto-sync polling every 12 seconds when idle
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDetailDrawerOpen && !isDeleteModalOpen && !searchQuery.trim()) {
        fetchUsers("", true);
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchUsers, isDetailDrawerOpen, isDeleteModalOpen, searchQuery]);

  // Open detail & edit drawer
  const handleOpenDetail = (user: FirestoreUser) => {
    setSelectedUser(user);
    setEditName(user.name);
    setIsDetailDrawerOpen(true);
  };

  // Update user name (PATCH /api/users/:id)
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!editName.trim()) {
      toastError("User name cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "Failed to update user name");
        return;
      }

      success(`User "${editName}" updated successfully`);
      setIsDetailDrawerOpen(false);
      // Refresh list
      fetchUsers(searchQuery);
    } catch {
      toastError("Failed to update user. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Trigger delete modal
  const handlePromptDelete = (user: FirestoreUser, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete (DELETE /api/users/:id)
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        toastError(data.error || "Failed to delete user");
        return;
      }

      success(`User "${userToDelete.name}" deleted from Firestore`);
      setIsDeleteModalOpen(false);
      if (selectedUser?.id === userToDelete.id) {
        setIsDetailDrawerOpen(false);
      }
      setUserToDelete(null);
      fetchUsers(searchQuery);
    } catch {
      toastError("Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Paginated slice
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return users.slice(startIndex, startIndex + itemsPerPage);
  }, [users, currentPage, itemsPerPage]);

  return (
    <AppShell
      primaryAction={
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Automatic Live Sync Indicator */}
          <div 
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold select-none shadow-2xs"
            title={`Real-time sync active (polled every 12s). Last synced: ${lastSyncedAt.toLocaleTimeString()}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">Auto-Sync</span>
            <span className="sm:hidden">Live</span>
          </div>

          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#071326] border border-slate-200 dark:border-slate-800 text-xs text-brand-teal dark:text-teal-300 font-medium">
            <Cpu className="w-3.5 h-3.5 text-brand-teal dark:text-teal-400" />
            Hardware Enrollment Only
          </span>

          <button
            onClick={() => fetchUsers(searchQuery, false)}
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
      <div className="space-y-6">
        {/* Hardware Mode Info Banner */}
        <div className="p-5 bg-white dark:bg-[#0c1f3d] border-2 border-slate-200 dark:border-slate-700/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-500/40 flex items-center justify-center text-[#0E6F70] dark:text-teal-300 shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-extrabold text-[#092B5A] dark:text-white text-sm">
                Hardware Enrollment Console
              </p>
              <p className="text-slate-600 dark:text-slate-300 font-medium mt-0.5 leading-relaxed">
                Personnel enroll directly on the Raspberry Pi terminal via RFID, optical fingerprint scanner, or camera. This dashboard monitors and manages synced profiles.
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or RFID UID..."
              className="w-full bg-white dark:bg-[#0c1f3d] border-2 border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-[#1733C0] focus:ring-2 focus:ring-[#1733C0]/15 transition-all shadow-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Total: <strong className="text-[#092B5A] dark:text-white font-extrabold">{users.length}</strong> enrolled
            </span>
            <button
              onClick={() => fetchUsers(searchQuery)}
              disabled={isLoading}
              title="Refresh users"
              className="btn-tactile-secondary p-2 rounded-xl"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin text-brand-blue dark:text-brand-sky" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Users Table Card */}
        <div className="bg-white dark:bg-[#0c1f3d] border-2 border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden transition-colors">
          {isLoading ? (
            <TableSkeleton rows={6} />
          ) : users.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={UsersIcon}
                title={searchQuery ? "No matching users found" : "No users enrolled yet"}
                description={
                  searchQuery
                    ? `No user records matched "${searchQuery}". Try refining your search.`
                    : "Personnel must enroll at the physical Raspberry Pi terminal using their RFID tag, fingerprint, or face. Enrolled users will automatically sync here."
                }
                actionLabel={searchQuery ? "Clear Search" : undefined}
                onAction={searchQuery ? () => setSearchQuery("") : undefined}
              />
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              {/* Mobile Swipe Hint */}
              <div className="sm:hidden px-3.5 py-1.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>Swipe table horizontally to view full details</span>
                <span>&rarr;</span>
              </div>
              <table className="w-full text-left text-sm table-sticky-header min-w-[560px]">
                <thead className="bg-slate-100 dark:bg-[#07152b] text-[#092B5A] dark:text-[#97C6E6] text-xs font-bold border-b-2 border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3 sm:py-4 sm:px-6">User Name</th>
                    <th className="py-3 px-3 sm:py-4 sm:px-6">RFID UID</th>
                    <th className="py-3 px-3 sm:py-4 sm:px-6">Fingerprint</th>
                    <th className="py-3 px-3 sm:py-4 sm:px-6">Hardware ID</th>
                    <th className="py-3 px-3 sm:py-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedUsers.map((user) => {
                    const isFingerprintEnrolled =
                      user.fingerprint_id !== null &&
                      user.fingerprint_id !== undefined;

                    return (
                      <tr
                        key={user.id}
                        onClick={() => handleOpenDetail(user)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                      >
                        {/* Avatar & Name */}
                        <td className="py-3 px-3 sm:py-4 sm:px-6">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <Avatar
                              name={user.name}
                              userId={user.id}
                              photoUrl={user.photo_url}
                              size="md"
                            />
                            <div>
                              <p className="font-bold text-[#092B5A] dark:text-white group-hover:text-[#1733C0] dark:group-hover:text-[#97C6E6] transition-colors text-xs sm:text-sm">
                                {user.name}
                              </p>
                              <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400">
                                Enrolled Profile
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Monospace RFID */}
                        <td className="py-3 px-3 sm:py-4 sm:px-6">
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2.5 sm:px-3 py-1 rounded-lg whitespace-nowrap">
                            <CreditCard className="w-3.5 h-3.5 text-[#1733C0] dark:text-[#97C6E6]" />
                            {user.rfid_uid || "—"}
                          </span>
                        </td>

                        {/* Fingerprint Status Badge (Yellow/Green) */}
                        <td className="py-3 px-3 sm:py-4 sm:px-6">
                          <Badge
                            variant={
                              isFingerprintEnrolled
                                ? "fingerprint-enrolled"
                                : "fingerprint-none"
                            }
                            label={
                              isFingerprintEnrolled
                                ? `Slot #${user.fingerprint_id}`
                                : "Not Enrolled"
                            }
                          />
                        </td>

                        {/* User ID */}
                        <td className="py-3 px-3 sm:py-4 sm:px-6 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                          #{user.id}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-3 sm:py-4 sm:px-6 text-right">
                          <div
                            className="inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleOpenDetail(user)}
                              className="p-1.5 sm:p-2 text-slate-600 hover:text-[#1733C0] dark:text-slate-400 dark:hover:text-[#97C6E6] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                              title="Edit User"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handlePromptDelete(user, e)}
                              className="p-1.5 sm:p-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                              title="Delete User"
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
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={users.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* User Detail & Edit Drawer */}
      <Drawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        title="User Profile"
        subtitle={selectedUser ? `ID: #${selectedUser.id}` : undefined}
        footer={
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (selectedUser) handlePromptDelete(selectedUser);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Record</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDetailDrawerOpen(false)}
                className="btn-tactile-secondary px-4 py-2 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="user-edit-form"
                disabled={isUpdating}
                className="btn-tactile-primary px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                {isUpdating && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        }
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Top avatar preview */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <Avatar
                name={selectedUser.name}
                userId={selectedUser.id}
                photoUrl={selectedUser.photo_url}
                size="lg"
              />
              <div>
                <h3 className="text-lg font-heading font-bold text-brand-navy dark:text-white">
                  {selectedUser.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Hardware Assigned ID: #{selectedUser.id}
                </p>
                {selectedUser.photo_url ? (
                  <span className="inline-block mt-1 text-[11px] text-brand-teal dark:text-teal-300 font-semibold">
                    Cloud Photo Synced
                  </span>
                ) : (
                  <span className="inline-block mt-1 text-[11px] text-slate-400">
                    Local Device Photo (Stored on Pi)
                  </span>
                )}
              </div>
            </div>

            {/* Editable Form */}
            <form id="user-edit-form" onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name (Editable)
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-blue"
                />
              </div>

              {/* Read-only Hardware Fields Notice */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-navy dark:text-slate-200">
                  <Info className="w-4 h-4 text-brand-teal dark:text-teal-400" />
                  Hardware-Linked Fields (Read-Only)
                </div>

                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">
                    RFID UID
                  </span>
                  <div className="font-mono text-xs text-brand-navy dark:text-slate-200 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    {selectedUser.rfid_uid || "—"}
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">
                    Fingerprint Sensor Slot
                  </span>
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-brand-navy dark:text-slate-200 font-mono">
                      {selectedUser.fingerprint_id !== null &&
                      selectedUser.fingerprint_id !== undefined
                        ? `Slot #${selectedUser.fingerprint_id}`
                        : "Not Enrolled on Sensor"}
                    </span>
                    <Badge
                      variant={
                        selectedUser.fingerprint_id !== null &&
                        selectedUser.fingerprint_id !== undefined
                          ? "fingerprint-enrolled"
                          : "fingerprint-none"
                      }
                      size="sm"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  RFID UID and fingerprint slot are tied to physical hardware
                  on the Raspberry Pi and cannot be modified from the web.
                </p>
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
        title={`Delete "${userToDelete?.name}"?`}
        message="Are you sure you want to delete this user record from the database? This action cannot be undone."
        warningNote="Deleting from Firestore removes the web record only. The Raspberry Pi's local SQLite database and sensor memory (fingerprint template and facial model) are NOT erased by this action."
        confirmLabel="Yes, Delete User"
        cancelLabel="Keep User"
        isDestructive={true}
      />
    </AppShell>
  );
}
