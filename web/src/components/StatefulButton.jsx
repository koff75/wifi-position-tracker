import React from 'react'

export default function StatefulButton({ loading, success, children, className = '', ...props }) {
  return (
    <button
      {...props}
      disabled={loading}
      className={`relative inline-flex items-center justify-center rounded-xl px-5 py-3 text-white transition disabled:opacity-60 ${className}`}
    >
      <span className={`absolute inset-0 rounded-xl bg-gradient-to-r from-fuchsia-600 to-sky-500 ${success ? 'opacity-0' : 'opacity-100'}`} />
      <span className={`absolute inset-0 rounded-xl bg-emerald-500 transition-opacity ${success ? 'opacity-100' : 'opacity-0'}`} />
      <span className="relative flex items-center gap-2">
        {loading && (
          <span className="btn-spinner" />
        )}
        {success && (
          <span className="btn-check" />
        )}
        <span>{children}</span>
      </span>
    </button>
  )
}


