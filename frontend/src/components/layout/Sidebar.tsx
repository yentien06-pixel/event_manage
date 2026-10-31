import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Building2,
  CalendarRange,
  ClipboardCheck,
  Receipt,
  FileBarChart2,
  BarChart3,
  Users,
  Settings,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useEvents } from "../../contexts/EventContext";
import { UserRole } from "../../types";

interface NavItemDef {
  to: string;
  label: string;
  icon: any;
  roles?: UserRole[];
  badge?: number;
  badgeText?: string;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { currentUser } = useAuth();
  const { events } = useEvents();

  // Đếm số lượng hồ sơ đang chờ duyệt tương ứng với vai trò của người dùng
  const pendingCount = events.filter((e) => {
    if (currentUser.role === "BCN_KHOA") return e.status === "FACULTY_REVIEW";
    if (currentUser.role === "DOAN_TRUONG") return e.status === "UNIVERSITY_REVIEW" || e.status === "BUDGET_REVIEW" || e.status === "FACULTY_APPROVED";
    if (currentUser.role === "CSVC") return e.status === "FACILITY_REVIEW" || e.status === "FACILITY_RETURN_PENDING" || e.status === "PERMIT_ISSUED";
    if (currentUser.role === "KHTC") return e.status === "FINANCE_REVIEW" || e.status === "FINANCE_APPROVAL_PENDING";
    if (currentUser.role === "BTC") return e.status.includes("REVISION_REQUESTED") || e.status === "FACILITY_CONFLICT";
    return false;
  }).length;

  // Danh mục menu chuẩn hóa, tối giản, KHÔNG trùng lặp theo từng vai trò
  const navItems: NavItemDef[] = [
    {
      to: "/",
      label: "Tổng quan hệ thống",
      icon: LayoutDashboard,
    },
    {
      to: "/approvals",
      label: "Hàng đợi xét duyệt",
      icon: CheckSquare,
      roles: ["BCN_KHOA", "DOAN_TRUONG", "CSVC", "KHTC", "ADMIN"],
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      to: "/events",
      label: "Hồ sơ sự kiện",
      icon: CalendarDays,
    },
    {
      to: "/calendar",
      label: "Lịch hội trường & CSVC",
      icon: CalendarRange,
    },
    {
      to: "/facilities",
      label: "Danh mục phòng & Thiết bị",
      icon: Building2,
      roles: ["CSVC", "ADMIN"],
    },
    {
      to: "/handover",
      label: "Bàn giao & Nghiệm thu",
      icon: ClipboardCheck,
      roles: ["CSVC", "BTC", "ADMIN"],
    },
    {
      to: "/settlements",
      label: "Quyết toán tài chính",
      icon: Receipt,
      roles: ["KHTC", "BTC", "ADMIN"],
    },
    {
      to: "/reports",
      label: "Báo cáo tổng kết",
      icon: FileBarChart2,
      roles: ["BTC", "DOAN_TRUONG", "ADMIN"],
    },
    {
      to: "/analytics",
      label: "Báo cáo & Đo lường KPI",
      icon: BarChart3,
      roles: ["BCN_KHOA", "DOAN_TRUONG", "CSVC", "KHTC", "ADMIN"],
    },
  ];

  const adminNavItems: NavItemDef[] = [
    { to: "/admin/users", label: "Quản trị người dùng & RBAC", icon: Users, roles: ["ADMIN"] },
    { to: "/admin/settings", label: "Cấu hình hệ thống & Tham số", icon: Settings, roles: ["ADMIN"] },
  ];

  // LỌC CHẶT CHẼ: Chỉ những mục menu phù hợp với vai trò hiện tại
  const visibleNavItems = navItems.filter((item) => !item.roles || item.roles.includes(currentUser.role));

  const renderContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* Brand Header: Logo DUE + 2 dòng tên trường theo nhận diện chính thức */}
      <div className="p-3.5 border-b border-[#04203b] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
            <img
              src="/images/due_logo_emblem.png"
              alt="Logo DUE"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold tracking-wider text-blue-200/90 uppercase leading-none truncate">
              ĐẠI HỌC ĐÀ NẴNG
            </div>
            <div className="text-xs font-bold text-white tracking-tight leading-tight mt-0.5 truncate">
              TRƯỜNG ĐH KINH TẾ
            </div>
            <div className="text-[9px] text-blue-300/80 leading-none mt-1 truncate">
              Quản lý quy trình sự kiện
            </div>
          </div>
        </div>

        {isMobile && (
          <button
            onClick={onClose}
            aria-label="Đóng thanh điều hướng"
            className="p-1 rounded-lg text-blue-300 hover:text-white hover:bg-blue-900/60 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links - flex-1 điền đầy chiều cao mà không cần khối tài khoản ở cuối */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-200/70 flex items-center justify-between mb-1">
          <span>Quyền hạn vai trò</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/80 text-blue-200 font-bold border border-blue-400/30">
            {currentUser.role}
          </span>
        </div>

        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => {
                if (isMobile && onClose) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#075ea1] text-white shadow-xs font-semibold"
                    : "text-slate-200 hover:bg-[#0b4379]/70 hover:text-white"
                }`
              }
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#ea580c] text-white min-w-4 text-center shrink-0">
                  {item.badge}
                </span>
              )}
              {item.badgeText && (
                <span className="px-1 py-0.2 text-[9px] font-bold rounded-md bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 shrink-0">
                  {item.badgeText}
                </span>
              )}
            </NavLink>
          );
        })}

        {currentUser.role === "ADMIN" && (
          <>
            <div className="px-2.5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-blue-200/70">
              Phân hệ Quản trị (Admin)
            </div>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    if (isMobile && onClose) onClose();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive ? "bg-[#075ea1] text-white font-semibold" : "text-slate-200 hover:bg-[#0b4379]/70 hover:text-white"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Sticky Sidebar (Visible on >= 1024px) ── */}
      <aside className="hidden lg:flex w-60 xl:w-64 bg-[#062c51] text-slate-200 flex-col shrink-0 h-screen sticky top-0 border-r border-[#04203b] z-30 select-none">
        {renderContent(false)}
      </aside>

      {/* ── Mobile / Tablet Drawer (Visible when isOpen is true on < 1024px) ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={onClose}
          />
          {/* Drawer Slide-out */}
          <div className="relative w-64 max-w-[80vw] bg-[#062c51] text-slate-200 flex flex-col h-full shadow-2xl z-10 select-none">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
