// src/pages/AppPage.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import SidebarComponent from "../components/SidebarComponent";

export default function AppPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <SidebarComponent />
      <main className="flex-1 ">
        {/* header */}

        {/* content */}
        <div className="">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
