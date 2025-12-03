import React, { useState, ChangeEvent } from "react";
import PageHeaderComponent from "../components/PageHeaderComponent";
import { auth } from "../firebase/firebase";

export default function SettingsPage() {
  const [name, setName] = useState(
    auth.currentUser?.displayName || "Sample User"
  );
  const [email, setEmail] = useState(
    auth.currentUser?.email || "sample@example.com"
  );
  const [avatar, setAvatar] = useState<string | null>(null);
  const [timezone, setTimezone] = useState("America/New_York");
  const [currency, setCurrency] = useState("USD");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyPush, setNotifyPush] = useState(true);

  function onAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (!f) return setAvatar(null);
    const url = URL.createObjectURL(f);
    setAvatar(url);
  }

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col overflow-hidden">
      <PageHeaderComponent title="Settings" />

      <div className="flex-1 overflow-hidden p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full p-6 flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-2xl font-bold text-slate-900">Settings</div>
              <div className="text-sm text-slate-500 mt-1">
                Manage account and preferences
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow hover:bg-blue-700 transition">
                Save Changes
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col gap-6">
            <div className="grid grid-cols-12 gap-6 h-full">
              {/* Account info (left) */}
              <section className="col-span-12 lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Account Info
                </h3>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-slate-400 font-semibold">
                        {name[0]}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs text-slate-500">
                      Avatar
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onAvatarChange}
                      className="mt-2 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Full name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Email
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm"
                    >
                      <option>America/New_York</option>
                      <option>America/Chicago</option>
                      <option>Europe/London</option>
                      <option>Asia/Tokyo</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Account & app settings (right) */}
              <section className="col-span-12 lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Account Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Preferred currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Payment method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm"
                    >
                      <option value="card">Card</option>
                      <option value="paypal">PayPal</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-xs font-medium text-slate-600 mb-3">
                    Notifications
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100">
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          Email notifications
                        </div>
                        <div className="text-xs text-slate-500">
                          Receive booking & reminder emails
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifyEmail}
                        onChange={() => setNotifyEmail((s) => !s)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                    </label>

                    <label className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100">
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          SMS notifications
                        </div>
                        <div className="text-xs text-slate-500">
                          Receive SMS reminders
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifySms}
                        onChange={() => setNotifySms((s) => !s)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                    </label>

                    <label className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100">
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          Push notifications
                        </div>
                        <div className="text-xs text-slate-500">
                          In-app alerts and updates
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifyPush}
                        onChange={() => setNotifyPush((s) => !s)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-auto">
                  <h4 className="text-xs font-medium text-slate-600 mb-3">
                    Security & Privacy
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100">
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          Two-factor authentication
                        </div>
                        <div className="text-xs text-slate-500">
                          Protect your account
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                    </label>

                    <label className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100">
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          Allow data for analytics
                        </div>
                        <div className="text-xs text-slate-500">
                          Share anonymized usage data
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        style={{ color: "#000" }}
                        className="form-checkbox h-5 w-5 text-blue-600"
                        defaultChecked
                      />
                    </label>
                  </div>
                </div>
              </section>
            </div>

            {/* bottom CTA / destructive actions */}
            <div className="flex items-center justify-end gap-4">
              <button className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition">
                Logout
              </button>

              <button className="px-4 py-2 rounded-lg border border-red-600 text-red-600 text-sm font-semibold hover:bg-red-50 transition">
                Delete account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
