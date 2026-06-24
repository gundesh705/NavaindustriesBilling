import { Outlet, NavLink, useNavigate } from "react-router";
import { menuItems } from "../data/mock";
import { LogOut, Search, UserCircle } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

export function Layout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans print:flex-col print:h-auto">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 text-gray-900 flex flex-col print:hidden">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F6081257f56164f79a999356618a191cf%2F7f1140a20eda4a7c80200900e7873d32?format=webp&width=800&height=1200"
            alt="Nava Industries Logo"
            className="w-10 h-10 object-contain"
          />

          <div>
            <h1 className="text-lg font-semibold tracking-tight text-gray-900">
              Nava Industries
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            if (
              item.name === "Products" ||
              item.name === "Reports"
            )
              return null;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
                    isActive
                      ? "bg-gray-900 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`
                }
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 w-full transition-all duration-200 font-medium text-sm"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm print:hidden">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                type="text"
                placeholder="Search invoices, products, or customers..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all text-sm text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  Kathiravan
                </p>
                <p className="text-xs text-gray-500">
                  Administrator
                </p>
              </div>

              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-700 shadow-sm">
                <UserCircle size={24} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-white p-8 print:p-0 print:bg-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
}