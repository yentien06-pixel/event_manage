import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  CheckSquare,
  Building2,
  CalendarRange,
  ClipboardCheck,
  Receipt,
  FileBarChart2,
  Sparkles,
  BarChart3,
  Users,
  Settings,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvents } from '../../contexts/EventContext';
import { roleNames } from '../../utils/helpers';
import { UserRole } from '../../types';

interface NavItemDef {
  to: string;
  label: string;
  icon: any;
  roles?: UserRole[];
  badge?: number;
  badgeText?: string;
}

export const Sidebar: React.FC = () => {
  const { currentUser } = useAuth();
  const { events, notifications } = useEvents();

  // Calculate pending items for current user's role
  const pendingCount = events.filter((e) => {
    if (currentUser.role === 'BCN_KHOA') return e.status === 'FACULTY_REVIEW';
    if (currentUser.role === 'DOAN_TRUONG')
      return e.status === 'UNIVERSITY_REVIEW' || e.status === 'BUDGET_REVIEW' || e.status === 'FACULTY_APPROVED';
    if (currentUser.role === 'CSVC')
      return e.status === 'FACILITY_REVIEW' || e.status === 'FACILITY_RETURN_PENDING' || e.status === 'PERMIT_ISSUED';
    if (currentUser.role === 'KHTC')
      return e.status === 'FINANCE_REVIEW' || e.status === 'FINANCE_APPROVAL_PENDING';
    if (currentUser.role === 'BTC')
      return e.status.includes('REVISION_REQUESTED') || e.status === 'FACILITY_CONFLICT';
    return false;
  }).length;

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  // Định nghĩa danh mục menu kèm vai trò được phép truy cập theo Sitemap
  const navItems: NavItemDef[] = [
    { 
      to: '/', 
      label: 'Tổng quan hệ thống', 
      icon: LayoutDashboard 
    },
    { 
      to: '/events', 
      label: currentUser.role === 'BTC' ? 'Hồ sơ sự kiện của tôi' : 'Danh sách hồ sơ sự kiện', 
      icon: CalendarDays 
    },
    { 
      to: '/events/create', 
      label: 'Tạo hồ sơ sự kiện mới', 
      icon: PlusCircle, 
      roles: ['BTC', 'ADMIN'] 
    },
    {
      to: '/approvals',
      label: 'Hàng đợi xét duyệt',
      icon: CheckSquare,
      roles: ['BCN_KHOA', 'DOAN_TRUONG', 'CSVC', 'KHTC', 'ADMIN'],
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { 
      to: '/calendar', 
      label: 'Lịch hội trường & CSVC', 
      icon: CalendarRange 
    },
    { 
      to: '/facilities', 
      label: 'Danh mục phòng & Thiết bị', 
      icon: Building2, 
      roles: ['CSVC', 'ADMIN'] 
    },
    { 
      to: '/handover', 
      label: 'Bàn giao & Nghiệm thu', 
      icon: ClipboardCheck, 
      roles: ['CSVC', 'BTC', 'ADMIN'] 
    },
    { 
      to: '/settlements', 
      label: 'Quyết toán tài chính', 
      icon: Receipt, 
      roles: ['KHTC', 'BTC', 'ADMIN'] 
    },
    { 
      to: '/reports', 
      label: 'Báo cáo tổng kết', 
      icon: FileBarChart2, 
      roles: ['BTC', 'DOAN_TRUONG', 'ADMIN'] 
    },
    { 
      to: '/ai-review', 
      label: 'Trợ lý AI rà soát', 
      icon: Sparkles, 
      badgeText: 'AI',
      roles: ['BTC', 'DOAN_TRUONG', 'BCN_KHOA', 'CSVC', 'KHTC', 'ADMIN'] 
    },
    { 
      to: '/analytics', 
      label: 'Báo cáo & Đo lường KPI', 
      icon: BarChart3, 
      roles: ['BCN_KHOA', 'DOAN_TRUONG', 'CSVC', 'KHTC', 'ADMIN'] 
    },
    { 
      to: '/notifications', 
      label: 'Thông báo', 
      icon: Bell, 
      badge: unreadNotifs > 0 ? unreadNotifs : undefined 
    },
  ];

  const adminNavItems: NavItemDef[] = [
    { to: '/admin/users', label: 'Quản trị người dùng & RBAC', icon: Users, roles: ['ADMIN'] },
    { to: '/admin/settings', label: 'Cấu hình hệ thống & Tham số', icon: Settings, roles: ['ADMIN'] },
  ];

  // LỌC CHẶT CHẼ: Chỉ những mục menu mà vai trò hiện tại ĐƯỢC PHÉP mới hiển thị lên Sidebar
  const visibleNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(currentUser.role)
  );

  return (
    <aside className="w-64 bg-[#062c51] text-slate-200 flex flex-col shrink-0 h-screen sticky top-0 border-r border-[#04203b] z-30 select-none">
      {/* Brand Header with DUE Crest */}
      <div className="p-4 border-b border-[#04203b] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
          <img
            src="/images/due_logo_emblem.png"
            alt="DUE Emblem"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-white tracking-tight flex items-center gap-1.5 text-base">
            <span>MY DUE</span>
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#075ea1] text-white">
              EventFlow
            </span>
          </div>
          <div className="text-[10px] text-blue-200 font-medium truncate">Đại học Kinh tế – ĐHĐN</div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-200/70 flex items-center justify-between">
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
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#075ea1] text-white shadow-sm font-semibold'
                    : 'text-slate-200 hover:bg-[#0b4379]/70 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#ea580c] text-white min-w-5 text-center shrink-0">
                  {item.badge}
                </span>
              )}
              {item.badgeText && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 shrink-0">
                  {item.badgeText}
                </span>
              )}
            </NavLink>
          );
        })}

        {currentUser.role === 'ADMIN' && (
          <>
            <div className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-blue-200/70">
              Phân hệ Quản trị (Admin)
            </div>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#075ea1] text-white font-semibold'
                        : 'text-slate-200 hover:bg-[#0b4379]/70 hover:text-white'
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

      {/* User Profile Widget */}
      <div className="p-3 border-t border-[#04203b] bg-[#04203b]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#075ea1] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{currentUser.fullName || 'Người dùng'}</div>
            <div className="text-[10px] text-blue-200 truncate font-semibold">{roleNames[currentUser.role] || currentUser.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
