import {Component, ErrorInfo, ReactNode} from 'react';
import {withTranslation, WithTranslation} from 'react-i18next';
import {AlertTriangle, RefreshCw} from 'lucide-react';

interface Props extends WithTranslation {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      const { t } = this.props;
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertTriangle size={48} className="text-amber-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('common.pageError')}</h3>
          <p className="text-sm text-slate-500 mb-4 max-w-md">
            {this.state.error?.message || t('common.unknownError')}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            <RefreshCw size={14} />
            {t('common.retry')}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
