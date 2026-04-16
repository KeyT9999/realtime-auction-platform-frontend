// Mục đích tệp: Trien khai logic/chuc nang chinh cua file errorUtils.
export const getErrorMessage = (error, fallback = 'Da xay ra loi') => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (typeof error.message === 'string' && error.message.trim()) return error.message;
  return fallback;
};
