"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { 
  HomeIcon, 
  BookOpenIcon, 
  Clipboard, 
  Settings, 
  Info 
} from "lucide-react";
import Image from "next/image";
import logo from '@/assets/logo.png'

export default function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean, toggleSidebar: () => void }) {
  const pathname = usePathname();
  const { user } = useUser();

  const menuItems = [
    { name: "Home", href: "/Home", icon: HomeIcon },
    { name: "Subjects", href: "/Subjects", icon: BookOpenIcon },
    { name: "Assessments", href: "/Assessments", icon: Clipboard },
  ];

  const bottomItems = [
    { name: "Settings", href: "/Settings", icon: Settings },
    { name: "About", href: "/About", icon: Info },
  ];

  const NavItem = ({ item }: { item: typeof menuItems[0] }) => {
    const isActive = pathname === item.href;
    return (
      <li>
        <Link
          href={item.href}
          onClick={() => isOpen && toggleSidebar()} // Close on mobile click
          className={`flex items-center  px-6 py-3 transition-all duration-200 group ${
            isActive 
              ? "bg-[#E3EEFA] text-[#1976D2] border-r-4 border-[#1976D2]" 
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"}`} strokeWidth={2.5} />
          <span className={`ms-4  text-xl tracking-wide ${isActive ? "font-bold" : "font-medium"}`}>
            {item.name}
          </span>
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-900/40 backdrop-blur-sm sm:hidden" 
          onClick={toggleSidebar} 
        />
      )}

      <aside 
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform bg-white 
          border-r border-gray-100 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0 shadow-sm`}
      >
        <div className="flex flex-col h-full py-6">
          {/* Top Spacer / Brand Area */}
          <div className="px-6 mb-10 h-10 flex items-center">
             {/* Optional: Add a small version of Logo or just keep it clean like the image */}
             <Link href="/">
             <Image src={logo} alt="Logo" width={300} height={300} />
             </Link>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1">
            <ul className="space-y-1">
              {menuItems.map((item) => <NavItem key={item.name} item={item} />)}
            </ul>
          </nav>

          {/* Bottom Navigation */}
          <div className="pt-4 mt-auto border-t border-gray-50">
            <ul className="space-y-1">
              {bottomItems.map((item) => <NavItem key={item.name} item={item} />)}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}
