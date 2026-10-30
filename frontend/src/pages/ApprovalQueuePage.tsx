import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  CheckCircle2,
  Eye,
  Calendar,
  Building,
  User,
  ShieldCheck,
  AlertCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { useEvents } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import { roleNames, formatDate, statusLabels, formatCurrency } from '../utils/helpers';

export const ApprovalQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { events, transitionEvent, saving } = useEvents();
  const { currentUser } = useAuth();
  const [filterType, setFilterType] = useState<'ALL' | 'CRITICAL' | 'NORMAL'>('ALL');

  // Filter events pending current user's approval role according to Sitemap & BPMN
  const queueEvents = events.filter((e) => {
    if (currentUser.role === 'BCN_KHOA') return e.status === 'FACULTY_REVIEW';
    if (currentUser.role === 'DOAN_TRUONG')
      return e.status === 'UNIVERSITY_REVIEW' || e.status === 'BUDGET_REVIEW' || e.status === 'FACULTY_APPROVED';
    if (currentUser.role === 'CSVC')
      return e.status === 'FACILITY_REVIEW' || e.status === 'FACILITY_RETURN_PENDING' || e.status === 'PERMIT_ISSUED';
    if (currentUser.role === 'KHTC')
      return e.status === 'FINANCE_REVIEW' || e.status === 'FINANCE_APPROVAL_PENDING';
    if (currentUser.role === 'BTC')
      return e.status.includes('REVISION_REQUESTED') || e.status === 'FACILITY_CONFLICT';
    return true; // Admin sees all
  });

  return (
    <div className="space-y-6">
      {/* Header with DUE Role Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#075F9F] border border-blue-200">
              {roleNames[currentUser.role]}
            </span>
            <span className="text-xs text-slate-400">Không gian làm việc chuyên trách</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Hàng đợi xét duyệt & Thẩm định nghiệp vụ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Các hồ sơ đang chờ đơn vị bạn thẩm định, phê duyệt hoặc ra quyết định (Tuân thủ Quy tắc 3 Click & Định luật Fitts)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#075F9F]" />
            <span>Đang chờ xử lý: <strong className="text-[#075F9F] font-bold ml-1">{queueEvents.length}</strong> hồ sơ</span>
          </div>
        </div>
      </div>

      {/* Queue Cards / Table */}
      {queueEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#0E9045] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không có hồ sơ nào đang chờ duyệt</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Tất cả các hồ sơ gửi đến vai trò {roleNames[currentUser.role]} đã được xử lý xong hoặc chưa phát sinh yêu cầu mới.
          </p>
          <button
            onClick={() => navigate('/events')}
            className="mt-2 px-4 py-2 bg-[#075F9F] hover:bg-[#054877] text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs transition-all"
          >
            Xem danh sách tất cả hồ sơ
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {queueEvents.map((ev) => {
            const statusInfo = statusLabels[ev.status];
            const totalBudget = (ev.budgetItems || []).reduce((s, i) => s + (Number(i.totalPrice) || 0), 0);

            return (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#075F9F] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {ev.eventCode}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo?.bg} ${statusInfo?.color} ${statusInfo?.border}`}
                    >
                      {statusInfo?.label}
                    </span>
                    <span className="text-xs text-slate-400">• Đơn vị: {ev.organizingUnit}</span>
                  </div>

                  <h3
                    onClick={() => navigate(`/events/${ev.id}`)}
                    className="text-base font-bold text-slate-900 hover:text-[#075F9F] transition-colors cursor-pointer"
                  >
                    {ev.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {ev.objectives || ev.description || 'Hồ sơ đề xuất tổ chức sự kiện dành cho sinh viên trường.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(ev.startDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {ev.preferredVenue}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {ev.contactPerson} ({ev.contactPhone})
                    </span>
                    {totalBudget > 0 && (
                      <span className="font-semibold text-slate-700">
                        Dự toán: <strong className="text-[#075F9F]">{formatCurrency(totalBudget)}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action buttons */}
                <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
                  <button
                    onClick={() => navigate(`/events/${ev.id}`)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#075F9F] hover:bg-[#054877] text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-all min-h-[38px]"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Thẩm định ngay</span>
                  </button>

                  {currentUser.role === 'BCN_KHOA' && ev.status === 'FACULTY_REVIEW' && (
                    <button
                      disabled={saving}
                      onClick={() =>
                        transitionEvent(ev.id, 'APPROVE', 'FACULTY_APPROVED', 'Ban Chủ nhiệm Khoa chấp thuận hồ sơ')
                      }
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#0E9045] hover:bg-[#0A6D34] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Duyệt nhanh</span>
                    </button>
                  )}

                  {currentUser.role === 'DOAN_TRUONG' &&
                    (ev.status === 'FACULTY_APPROVED' || ev.status === 'UNIVERSITY_REVIEW') && (
                      <button
                        disabled={saving}
                        onClick={() =>
                          transitionEvent(
                            ev.id,
                            'APPROVE',
                            'PERMIT_ISSUED',
                            'Đoàn Trường cấp phép tổ chức chính thức'
                          )
                        }
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#0E9045] hover:bg-[#0A6D34] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-all disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Cấp phép nhanh</span>
                      </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
