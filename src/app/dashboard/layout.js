// src/app/dashboard/layout.js
export default function DashboardLayout({ children }) {
  // The layout logic has been moved to the root DashboardWrapper
  // This layout now just passes through children for /dashboard routes
  return children;
}
