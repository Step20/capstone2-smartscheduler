import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

// Icons
import {
  AiOutlineHome,
  AiOutlineTeam,
  AiOutlineCalendar,
  AiOutlineBarChart,
  AiOutlineSetting,
} from "react-icons/ai";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { LuBotMessageSquare } from "react-icons/lu";
import logo from "../assets/logo2.png";
import useAuth from "../utils/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function SidebarComponent() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const uid = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    navigate("/signin");
    await signOut(auth);
  };

  // If user is not logged in, avoid crashing — send them to signin page
  const base = uid ? `/${uid}` : "/signin";

  const navItems = [
    {
      to: `${base}/dashboard`,
      label: "Dashboard",
      icon: <AiOutlineHome size={22} />,
    },
    {
      to: `${base}/people`,
      label: "People",
      icon: <AiOutlineTeam size={22} />,
    },
    {
      to: `${base}/schedule`,
      label: "Schedule",
      icon: <AiOutlineCalendar size={22} />,
    },
    {
      to: `${base}/analytics`,
      label: "Analytics",
      icon: <AiOutlineBarChart size={22} />,
    },
    {
      to: `${base}/ai-chat`,
      label: "AI Assistant",
      icon: <LuBotMessageSquare size={22} />,
    },
    {
      to: `${base}/settings`,
      label: "Settings",
      icon: <AiOutlineSetting size={22} />,
    },
  ];

  const navClass = (isActive: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-[16px] transition-all ${
      isActive
        ? "bg-white text-blue-600 font-bold"
        : "text-slate-700 hover:bg-slate-100 font-medium"
    }`;

  return (
    <aside className="w-[290px] bg-slate-50 h-screen flex flex-col justify-between px-6 pt-8 pb-6">
      <div>
        {/* LOGO */}
        <div className="flex items-center gap-2 mb-6">
          <a
            href="/"
            className="cursor-pointer w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition"
          >
            <img src={logo} alt="Logo" className="w-6 h-6" />
          </a>
          <h1 className="text-[24px] font-bold text-slate-900">Schedulr.ai</h1>
        </div>

        {/* PROFILE CARD */}
        <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-sm mb-8 cursor-pointer hover:shadow-md transition">
          {auth.currentUser?.photoURL ? (
            <img
              src={auth.currentUser?.photoURL || "https://placehold.co/50x50"}
              alt="User"
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg flex-shrink-0">
              {auth.currentUser?.displayName
                ? auth.currentUser.displayName.charAt(0).toUpperCase()
                : "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[16px] line-clamp-1 font-semibold text-slate-900">
              {auth.currentUser?.displayName || "User"}
            </div>
            <div className="text-[12px] text-slate-500 w-29 overflow-hidden text-ellipsis ">
              {auth.currentUser?.email || "Sample account"}
            </div>
          </div>
          <button
            className="cursor-pointer p-1 hover:bg-slate-50 rounded-lg transition-colors"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {dropdownOpen ? (
              <ChevronUpIcon className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-slate-400" />
            )}
          </button>
          {dropdownOpen && (
            <div className="absolute top-50 z-50 left-25 w-38 rounded-lg shadow-sm bg-white border border-slate-200">
              <div>
                <NavLink
                  to={`${base}/settings`}
                  className="flex items-center gap-2 px-4 py-2 w-full text-left text-slate-700 hover:bg-white/5"
                >
                  <AiOutlineSetting size={22} /> Settings
                </NavLink>
              </div>

              <hr className="my-1 border-white/10" />
              <button
                onClick={handleSignOut}
                className="flex items-center cursor-pointer hover:text-red-600 gap-2 px-4 py-2 w-full text-left text-gray-300 hover:bg-white/5"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-1 bg-white p-3 rounded-2xl shadow-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => navClass(isActive)}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* CTA */}
      <div className="bg-blue-600 rounded-2xl px-6 py-4 text-white shadow-lg">
        <div className="text-[20px] font-bold">20 Days Left</div>
        <div className="text-[14px] opacity-95">Extend your members today!</div>

        <button className="w-full bg-white text-black mt-5 py-2 rounded-full font-semibold text-[15px] hover:bg-gray-100 transition">
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}
