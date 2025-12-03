import React, { useEffect, useRef, useState } from "react";
import {
  BellIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import useAuth from "../utils/useAuth";

type Props = {
  title?: string;
};

export default function PageHeaderComponent({ title = "" }: Props) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const uid = useAuth();

  useEffect(() => {
    if (isSearchOpen) inputRef.current?.focus();
  }, [isSearchOpen]);

  return (
    <div className="px-8 pt-6 pb-4 border-b border-slate-200">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>

        <div className="flex items-center">
          <div className="flex items-center">
            {isSearchOpen && (
              <input
                ref={inputRef}
                type="text"
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 transition-all"
              />
            )}

            <button
              onClick={() => {
                setIsSearchOpen((s) => !s);
                if (isSearchOpen) setSearchQuery("");
              }}
              className="cursor-pointer p-2 hover:bg-slate-200 bg-slate-200/60 rounded-lg transition-colors mr-2"
              aria-label={isSearchOpen ? "Close search" : "Open search"}
            >
              {isSearchOpen ? (
                <XMarkIcon className="w-6 h-6 text-slate-600" />
              ) : (
                <MagnifyingGlassIcon className="w-6 h-6 text-slate-600" />
              )}
            </button>
            <button
              onClick={() => navigate(`/${uid}/appointment`)}
              className="cursor-pointer font-semibold text-slate-600 mr-2 flex items-center p-2 hover:bg-slate-200 bg-slate-200/60
              rounded-lg transition-colors"
            >
              <EyeIcon className="w-6 h-6 text-slate-600 mr-2" />
              Preview
            </button>
          </div>

          <button
            className="cursor-pointer p-2 hover:bg-slate-200 bg-slate-200/60  rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <BellIcon className="w-6 h-6 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
