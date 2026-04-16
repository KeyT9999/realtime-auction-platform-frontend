// Mục đích tệp: Trien khai logic/chuc nang chinh cua file PageLoading.
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-3 border-slate-200 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-slate-400 font-medium">Đang tải...</p>
    </div>
  </div>
);

export default PageLoading;
