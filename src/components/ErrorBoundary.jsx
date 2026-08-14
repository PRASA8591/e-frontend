import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[React Error Boundary Caught Error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/50 rounded-2xl flex items-center justify-center text-red-500 mb-6 border border-red-100 dark:border-red-900/50">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Something Went Wrong
            </h2>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-6 leading-relaxed">
              The application encountered an unexpected display error. Your financial data remains safe.
            </p>

            <div className="w-full flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={this.handleReload}
                className="flex-1 bg-prasatek-primary hover:bg-[#09734a] text-white font-extrabold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </button>
            </div>

            {this.state.error && (
              <details className="w-full text-left bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <summary className="text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer uppercase tracking-wider outline-none">
                  Technical Details
                </summary>
                <p className="text-xs font-mono text-red-600 dark:text-red-400 mt-2 break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-2 overflow-x-auto max-h-40 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
