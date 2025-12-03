import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo2.png";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function SignInPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      navigate(`/${uid}/dashboard`);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-[1200px] w-full grid grid-cols-12 gap-6 items-stretch">
        {/* Left: form card */}
        <div className="col-span-12 lg:col-span-4 flex items-center">
          <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-12">
                <a
                  href="/"
                  className="cursor-pointer w-6 h-6 bg-blue-600 transition scale-100 duration-150 hover:scale-105 hover:bg-blue-700 rounded-lg flex items-center justify-center"
                >
                  <img src={logo} alt="Logo" className="w-5 h-5" />
                </a>
                <h1 className="text-[16px] font-bold text-slate-900 hover:text-slate-900/90 transition  duration-150  cursor-pointer">
                  Schedulr.ai
                </h1>
              </div>{" "}
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {mode === "sign-in"
                  ? "Sign in to your account"
                  : "Create an account"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage appointments, people and analytics
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "sign-up" && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Full name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jane Doe"
                    required={mode === "sign-up"}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              <p className="text-xs text-red-600 text-center">{error}</p>
              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />{" "}
                  Remember me
                </label>
                {mode === "sign-in" && (
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow hover:bg-blue-700 transition"
                >
                  {mode === "sign-in" ? "Sign In" : "Create account"}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center text-xs text-slate-500">
              <div
                onClick={() => navigate("/signup")}
                className="text-sm text-blue-600 cursor-pointer font-medium hover:underline"
              >
                Create an account
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs text-slate-500 text-center mb-3">
                Or continue with
              </div>
              <div className="flex gap-3">
                <button className="flex-1 px-3 py-2 rounded-md border border-slate-100 bg-white text-sm hover:shadow transition">
                  Google
                </button>
                <button className="flex-1 px-3 py-2 rounded-md border border-slate-100 bg-white text-sm hover:shadow transition">
                  Apple
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: decorative panel */}
        <div className="col-span-12 lg:col-span-8 flex items-center justify-center">
          <div className="w-full h-[640px] rounded-2xl overflow-hidden relative">
            {/* blue gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-300"></div>

            {/* abstract curved SVG lines */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1200 800"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="gA" x1="0" x2="1">
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.06" />
                </linearGradient>
              </defs>

              <path
                d="M0 200 C200 100 400 300 600 200 C800 100 1000 300 1200 200 L1200 800 L0 800 Z"
                fill="url(#gA)"
                opacity="0.9"
              />
              <path
                d="M0 350 C250 250 450 450 700 350 C950 250 1050 450 1200 350"
                stroke="#93C5FD"
                strokeWidth="2"
                fill="none"
                strokeOpacity="0.6"
              />
              <circle cx="920" cy="160" r="80" fill="#BFDBFE" opacity="0.25" />
              <circle cx="400" cy="120" r="40" fill="#EFF6FF" opacity="0.45" />
            </svg>

            {/* centered content label (keeps visual parity with provided mock) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-slate-800 text-2xl font-semibold opacity-60"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
