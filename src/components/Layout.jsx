import { Outlet, Link, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md shadow-sm z-50 flex items-center px-4 md:px-8">
        {!isHome && (
          <Link to="/" className="mr-4 text-gray-600 hover:text-black transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span className="font-medium">返回</span>
          </Link>
        )}
        <h1 className="text-xl font-bold tracking-wider text-gray-900">Encantar Prototype</h1>
      </header>

      <main className="flex-1 flex flex-col relative">
        <Outlet />
      </main>
    </div>
  );
}
