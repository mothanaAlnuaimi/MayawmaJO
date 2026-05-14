// Reusable UI components for Forsati

// Button Component
export function Button({ children, variant = 'primary', size = 'md', loading = false, className = '', ...props }) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-orange-500 hover:bg-orange-600 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-blue-600 hover:bg-blue-50',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// Input Component
export function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${Icon ? 'pr-10' : ''} ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

// Select Component
export function Select({ label, error, options = [], className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <select
        className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

// Card Component
export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Badge Component
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-orange-100 text-orange-700',
    danger: 'bg-red-100 text-red-700',
    verified: 'bg-blue-600 text-white',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// Alert Component
export function Alert({ children, type = 'info', className = '' }) {
  const types = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
  };
  return (
    <div className={`border rounded-xl p-4 text-sm ${types[type]} ${className}`}>
      {children}
    </div>
  );
}

// Loading Spinner
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg className={`animate-spin text-blue-600 ${sizes[size]}`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

// Empty State
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon size={28} className="text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

// Trust Score Badge
export function TrustScoreBadge({ score }) {
  const color = score >= 70 ? 'green' : score >= 40 ? 'orange' : 'red';
  const label = score >= 70 ? 'موثوق' : score >= 40 ? 'متوسط' : 'منخفض';
  const colorClass = {
    green: 'bg-green-100 text-green-700 border-green-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  }[color];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${color === 'green' ? 'bg-green-500' : color === 'orange' ? 'bg-orange-500' : 'bg-red-500'}`} />
      ثقة {score}% · {label}
    </span>
  );
}

// Risk Badge
export function RiskBadge({ score }) {
  if (score < 30) return null;
  const isHigh = score >= 60;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isHigh ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
      ⚠️ {isHigh ? 'تحذير' : 'يحتاج مراجعة'}
    </span>
  );
}

// Modal
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
