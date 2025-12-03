// ...existing code...
import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeaderComponent from "../components/PageHeaderComponent";
import useAuth from "../utils/useAuth";

export default function NotFoundPage() {
  const uid = useAuth();
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col overflow-hidden">
      <PageHeaderComponent title="Not found" />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="text-6xl font-bold text-slate-900 mb-3">404</div>
          <div className="text-xl font-semibold text-slate-800 mb-2">
            Page not found
          </div>
          <div className="text-sm text-slate-500 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-slate-50 cursor-pointer border border-slate-100 rounded-lg text-sm hover:shadow transition"
            >
              Go back
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              Go to Sign up
            </button>

            <button
              onClick={() =>
                uid ? navigate(`${uid}/dashboard`) : navigate("/signin")
              }
              className="px-4 cursor-pointer py-2 bg-white border border-slate-100 rounded-lg text-sm hover:shadow transition"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// ...existing code...
