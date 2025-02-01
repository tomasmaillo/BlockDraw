import React from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4">{children}</main>
    </div>
  )
}

export default Layout
