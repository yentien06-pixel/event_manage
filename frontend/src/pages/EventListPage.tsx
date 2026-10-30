import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Eye,
  Edit,
  Sparkles,
  Calendar,
  Building,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useEvents } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import { statusLabels, formatDate, formatCurrency } from '../utils/helpers';

export const EventListPage: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useEvents();
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [unitFilter, setUnitFilter] = useState<string>('ALL');

  // Filter list
  const filteredEvents = events.filter((ev) => {
    const matchSearch =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.eventCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.organizingUnit.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'PENDING'
        ? ['FACULTY_REVIEW', 'UNIVERSITY_REVIEW', 'BUDGET_REVIEW', 'FACILITY_REVIEW', 'FINANCE_REVIEW'].includes(ev.status)
        : statusFilter === 'REVISION'
        ? ev.status.includes('REVISION') || ev.status === 'FACILITY_CONFLICT'
        : statusFilter === 'APPROVED'
        ? ['PERMIT_ISSUED', 'FACILITY_RESERVED', 'READY_FOR_EVENT', 'EVENT_IN_PROGRESS'].includes(ev.status)
        : statusFilter === 'COMPLETED'
        ? ev.status === 'COMPLETED'
        : ev.status === statusFilter;

    const matchUnit = unitFilter === 'ALL' || ev.organizingUnit === unitFilter;

    return matchSearch && matchStatus && matchUnit;
  });

  const uniqueUnits = Array.from(new Set(events.map((e) => e.organizingUnit)));

  // Quick tab counts
  const countAll = events.length;
  const countPending = events.filter((e) =>
    ['FACULTY_REVIEW', 'UNIVERSITY_REVIEW', 'BUDGET_REVIEW', 'FACILITY_REVIEW', 'FINANCE_REVIEW'].includes(e.status)
  ).length;
  const countRevision = events.filter((e) => e.status.includes('REVISION') || e.status === 'FACILITY_CONFLICT').length;
  const countApproved = events.filter((e) =>
    ['PERMIT_ISSUED', 'FACILITY_RESERVED', 'READY_FOR_EVENT', 'EVENT_IN_PROGRESS'].includes(e.status)
  ).length;
  const countCompleted = events.filter((e) => e.status === 'COMPLETED').length;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {currentUser.role === 'BTC' ? 'Hồ sơ sự kiện của tôi' : 'Danh mục hồ sơ sự kiện'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý toàn diện vòng đời tiếp nhận, xét duyệt, mượn cơ sở vật chất và quyết toán
          </p>
        </div>

        {['BTC', 'ADMIN'].includes(currentUser.role) && (
          <button
            onClick={() => navigate('/events/create')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#075F9F] hover:bg-[#054877] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto min-h-[40px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo hồ sơ mới (5 bước)</span>
          </button>
        )}
      </div>

      {/* Role-Smart Quick Filter Tabs according to Sitemap */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'ALL', label: 'Tất cả hồ sơ', count: countAll },
          { key: 'PENDING', label: 'Chờ xét duyệt', count: countPending },
          { key: 'REVISION', label: 'Cần bổ sung / Sửa', count: countRevision },
          { key: 'APPROVED', label: 'Đã cấp phép', count: countApproved },
          { key: 'COMPLETED', label: 'Đã hoàn tất', count: countCompleted },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              statusFilter === tab.key
                ? 'bg-[#075F9F] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã hồ sơ, tên sự kiện, đơn vị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:bg-white focus:border-[#075F9F] focus:ring-1 focus:ring-[#075F9F]"
            />
          </div>

          {/* Unit Filter */}
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            aria-label="Lọc theo đơn vị tổ chức"
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-hidden focus:border-[#075F9F] cursor-pointer max-w-[220px] truncate"
          >
            <option value="ALL">Tất cả đơn vị tổ chức</option>
            {uniqueUnits.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Hiển thị <span className="font-bold text-slate-800">{filteredEvents.length}</span> / {events.length} hồ sơ
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Mã hồ sơ</th>
                <th className="py-3 px-4">Tên sự kiện & Đơn vị</th>
                <th className="py-3 px-4">Thời gian tổ chức</th>
                <th className="py-3 px-4">Hội trường dự kiến</th>
                <th className="py-3 px-4">Dự toán</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy hồ sơ sự kiện nào phù hợp điều kiện lọc
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => {
                  const statusInfo = statusLabels[ev.status];
                  const totalBudget = (ev.budgetItems || []).reduce((s, i) => s + (Number(i.totalPrice) || 0), 0);

                  return (
                    <tr
                      key={ev.id}
                      onClick={() => navigate(`/events/${ev.id}`)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#075F9F] whitespace-nowrap">
                        <span className="bg-blue-50 group-hover:bg-white px-2 py-0.5 rounded border border-blue-200">
                          {ev.eventCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 group-hover:text-[#075F9F] line-clamp-1 transition-colors">
                          {ev.title}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{ev.organizingUnit}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(ev.startDate)}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[140px]">{ev.preferredVenue}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-700">
                        {totalBudget > 0 ? formatCurrency(totalBudget) : '--'}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo?.bg} ${statusInfo?.color} ${statusInfo?.border}`}
                        >
                          {statusInfo?.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/events/${ev.id}`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#075F9F] hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Xem chi tiết hồ sơ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {['BTC', 'ADMIN'].includes(currentUser.role) && (
                            <button
                              onClick={() => navigate(`/events/${ev.id}/edit`)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Chỉnh sửa hồ sơ"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/ai-review?eventId=${ev.id}`)}
                            className="p-1.5 rounded-lg text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Rà soát bằng AI"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
