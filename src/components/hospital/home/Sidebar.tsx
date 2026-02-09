"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { name: "🏠", label: "Home", route: "/hospital/home" },
  { name: "🩸", label: "Inventory", route: "/hospital/inventory" },
  { name: "📊", label: "Analytics", route: "/hospital/analytics" },
  { name: "💳", label: "Credit", route: "/hospital/credit" },
  { name: "🧾", label: "Logs", route: "/hospital/logs" },
  { name: "⚙️", label: "Settings", route: "/hospital/settings" },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full bg-gray-900/60 backdrop-blur-xl border-r border-gray-700/50 text-white w-24 flex flex-col items-center py-8 space-y-6">
      <div className="text-2xl font-bold text-red-500">H</div>
      <nav className="flex flex-col items-center space-y-4">
        {navItems.map((item, index) => (
          <Link key={item.label} href={item.route} passHref>
            <motion.div
              className={`relative cursor-pointer p-3 rounded-lg group ${
                pathname === item.route ? "bg-blue-600/50" : ""
              }`}
              whileHover={{ scale: 1.1 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="text-2xl">{item.name}</span>
              <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {item.label}
              </span>
            </motion.div>
          </Link>
        ))}
      </nav>
      <div className="mt-auto">
        {/* Profile Section */}
        <motion.div 
          className="w-12 h-12 bg-gray-700 rounded-full cursor-pointer"
          whileHover={{ scale: 1.1, rotate: 15 }}
        >
          {/* Placeholder for profile photo */}
        </motion.div>
      </div>
    </aside>
  );
};

export default Sidebar;
