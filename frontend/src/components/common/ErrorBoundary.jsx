import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';
import Card from './Card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;

      // Use custom fallback if provided
      if (fallback) {
        return fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleReset,
        });
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <div className="text-center py-8">
              {/* Error Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>

              {/* Error Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Oops! Something went wrong
              </h1>

              {/* Error Description */}
              <p className="text-lg text-gray-600 mb-8">
                We're sorry for the inconvenience. An unexpected error has occurred.
                Please try refreshing the page or go back to the home page.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Card variant="outlined" className="text-left mb-8 bg-red-50 border-red-200">
                  <Card.Header>
                    <Card.Title className="text-red-900">Error Details</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-red-900 mb-2">Error Message:</h4>
                        <pre className="text-sm text-red-800 bg-red-100 p-3 rounded overflow-x-auto">
                          {this.state.error.toString()}
                        </pre>
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <h4 className="font-semibold text-red-900 mb-2">Component Stack:</h4>
                          <pre className="text-xs text-red-800 bg-red-100 p-3 rounded overflow-x-auto max-h-64 overflow-y-auto">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<RefreshCw className="w-5 h-5" />}
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>
                <Link to="/">
                  <Button
                    variant="outline"
                    size="lg"
                    icon={<Home className="w-5 h-5" />}
                  >
                    Go to Home
                  </Button>
                </Link>
              </div>

              {/* Support Link */}
              <p className="mt-8 text-sm text-gray-500">
                If the problem persists, please{' '}
                <a
                  href="/contact"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  contact support
                </a>
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
