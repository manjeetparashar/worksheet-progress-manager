import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { console.error("Uncaught error:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-red-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-2">System Error</h2>
                        <button onClick={()=>window.location.reload()} className="px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 font-bold">Reload</button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}