import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Toast } from '../common/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { useEvents } from '../../contexts/EventContext';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const auth = useAuth();
  const { loading, syncError, saving, refresh, importLegacy } = useEvents();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Tự động đóng drawer menu khi chuyển route trên màn hình nhỏ
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center p-6 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-[#075F9F] animate-spin" />
          <span>Đang xác thực thông tin tài khoản...</span>
        </div>
      </div>
    );
  }

  if (!auth.authenticated) return <Navigate to="/login" replace />;

  const downloadLegacy = () => {
    const raw = localStorage.getItem('eventflow_events_v1') || '[]';
    const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'eventflow-ho-so-cu.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-[#F6F8FB] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-3.5 sm:p-4 lg:p-6 overflow-y-auto overflow-x-hidden min-w-0">
          {syncError && (
            <div
              role="alert"
              className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Không đồng bộ được với máy chủ: {syncError}</span>
              </div>
              <button
                onClick={() => void refresh()}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
              >
                Thử lại
              </button>
            </div>
          )}

          {localStorage.getItem('eventflow_events_v1') && (
            <details className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <summary className="font-bold cursor-pointer flex items-center gap-1.5 text-amber-800">
                📦 Phát hiện hồ sơ lưu cục bộ trên trình duyệt này
              </summary>
              <p className="mt-1 text-slate-600 leading-relaxed">
                Nhập hồ sơ thuộc tài khoản đang đăng nhập thành bản nháp trên máy chủ để kiểm tra và nộp lại.
              </p>
              <div className="mt-2.5 flex items-center gap-3">
                <button
                  onClick={downloadLegacy}
                  className="px-3 py-1 bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 rounded-lg font-medium cursor-pointer"
                >
                  Tải bản sao JSON
                </button>
                <button
                  disabled={saving}
                  onClick={() => void importLegacy()}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold cursor-pointer disabled:opacity-50"
                >
                  Nhập lên máy chủ
                </button>
              </div>
            </details>
          )}

          {saving && (
            <div role="status" className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-[#075F9F] font-semibold flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Đang lưu và đồng bộ dữ liệu lên máy chủ...</span>
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 font-medium">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
                <RefreshCw className="w-4 h-4 text-[#075F9F] animate-spin" />
                <span>Đang tải dữ liệu hồ sơ sự kiện...</span>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
      <Toast />
    </div>
  );
};
