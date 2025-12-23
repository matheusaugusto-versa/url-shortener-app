'use client';

import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-red-950">
          <div className="text-center px-4">
            <h1 className="text-3xl font-bold text-red-900 dark:text-red-100 mb-2">
              Oops! Algo deu errado
            </h1>
            <p className="text-red-700 dark:text-red-200 mb-4">
              {this.state.error?.message || 'Um erro inesperado ocorreu'}
            </p>
            <div className="space-y-2">
              <button
                onClick={this.resetError}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Tentar Novamente
              </button>
              <p className="text-xs text-red-600 dark:text-red-300 mt-4">
                ID do Erro: {Date.now()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
