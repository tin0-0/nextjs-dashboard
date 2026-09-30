import SideNav from '@/app/ui/dashboard/sidenav';
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-gray-100">
      {/* Sidebar Area */}
      <div className="w-full flex-none md:w-64 bg-white border-r border-gray-200">
        <SideNav />
      </div>
      {/* Dynamic Content Area */}
      <div className="grow p-6 md:overflow-y-auto md:p-12">
        {children}
      </div>
    </div>
  );
}
