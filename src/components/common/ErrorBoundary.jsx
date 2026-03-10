import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, errorInfo);
    }
    if (typeof window !== 'undefined' && window.__REACT_ERROR_LOG__) {
      window.__REACT_ERROR_LOG__({ error, errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          className="min-h-[200px] flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-lg"
          role="alert"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Đã xảy ra lỗi
          </h2>
          <p className="text-sm text-gray-600 mb-4 text-center max-w-md">
            Trình duyệt đã gặp sự cố. Vui lòng tải lại trang hoặc thử lại sau.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-primary-blue text-white rounded hover:opacity-90"
          >
            Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
