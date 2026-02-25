'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, MapPin, Mail, Save, Activity, Shield, Bell, CheckCircle2, AlertCircle, Building2, History, ArrowRight } from 'lucide-react';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'] });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    location: '',
    email: '',
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/hospital/settings');
      if (res.ok) {
        const data = await res.json();
        // The API now returns { hospital, logs }
        const hospitalData = data.hospital || data; // Fallback for older API versions if any
        setFormData({
          name: hospitalData.name || '',
          contact: hospitalData.contact || '',
          location: hospitalData.location || '',
          email: hospitalData.email || '',
        });
        if (data.logs) {
          setLogs(data.logs);
        }
      } else {
        const errText = await res.text();
        setMessage({ type: 'error', text: `Fetch Error: ${res.status} - ${errText}` });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `Fetch Failed: ${error.message}` });
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/hospital/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Settings updated successfully!' });
        fetchSettings(); // Refresh data and logs
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update settings.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Hospital Profile', icon: User },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`w-full max-w-6xl mx-auto ${jakarta.className}`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className={`${outfit.className} text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-rose-300 to-orange-400 mb-4`}>
          Hospital Settings
        </h1>
        <p className="text-neutral-400 text-lg">Manage your facility profile, security, and operational preferences.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 space-y-2"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 relative overflow-hidden group ${isActive
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-white/5 border border-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-red-500/5 z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-red-400' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
                <span className={`font-medium relative z-10 ${outfit.className}`}>{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-9"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            {/* Decorative background blur */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2" />

            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Current Details Display Section */}
                  <div className="mb-12">
                    <h2 className={`${outfit.className} text-xl font-semibold text-white mb-6 flex items-center gap-2`}>
                      <Building2 className="w-5 h-5 text-red-400" />
                      Current Facility Status
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <motion.div
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-start gap-4 group transition-colors hover:bg-white/10 hover:border-red-500/30"
                      >
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-neutral-400 mb-1">Hospital Name</p>
                          <p className={`text-lg text-white font-medium truncate ${outfit.className}`}>
                            {formData.name || 'Not Set'}
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-start gap-4 group transition-colors hover:bg-white/10 hover:border-red-500/30"
                      >
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-neutral-400 mb-1">Registered Email</p>
                          <p className={`text-lg text-white font-medium truncate ${outfit.className}`}>
                            {formData.email || 'Not Set'}
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-start gap-4 group transition-colors hover:bg-white/10 hover:border-red-500/30"
                      >
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-neutral-400 mb-1">Contact Number</p>
                          <p className={`text-lg text-white font-medium truncate ${outfit.className}`}>
                            {formData.contact || 'Not Set'}
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-start gap-4 group transition-colors hover:bg-white/10 hover:border-red-500/30"
                      >
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors flex-shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-neutral-400 mb-1">Physical Address</p>
                          <p className={`text-sm text-white font-medium line-clamp-2 ${outfit.className}`} title={formData.location}>
                            {formData.location || 'Not Set'}
                          </p>
                        </div>
                      </motion.div>

                    </div>
                  </div>

                  <div className="mb-8 pt-8 border-t border-white/10">
                    <h2 className={`${outfit.className} text-xl font-semibold text-white mb-2 flex items-center gap-2`}>
                      <Activity className="w-5 h-5 text-red-400" />
                      Update Details
                    </h2>
                    <p className="text-neutral-400 text-sm">Update your core hospital details visible on the network.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* Name Field */}
                      <div className="space-y-2 group">
                        <label className="text-sm font-medium text-neutral-400 group-focus-within:text-red-400 transition-colors">
                          Hospital Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="w-5 h-5 text-neutral-500 group-focus-within:text-red-400 transition-colors" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                            placeholder="Enter hospital name"
                            required
                          />
                        </div>
                      </div>

                      {/* Email Field (Read Only usually, but let's show it) */}
                      <div className="space-y-2 group">
                        <label className="text-sm font-medium text-neutral-400">
                          Registered Email (Read Only)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="w-5 h-5 text-neutral-600" />
                          </div>
                          <input
                            type="email"
                            value={formData.email}
                            readOnly
                            className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-neutral-500 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Contact Field */}
                      <div className="space-y-2 group">
                        <label className="text-sm font-medium text-neutral-400 group-focus-within:text-red-400 transition-colors">
                          Contact Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="w-5 h-5 text-neutral-500 group-focus-within:text-red-400 transition-colors" />
                          </div>
                          <input
                            type="text"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                            placeholder="e.g. +91 9876543210"
                            required
                          />
                        </div>
                      </div>

                      {/* Location Field */}
                      <div className="space-y-2 group md:col-span-2">
                        <label className="text-sm font-medium text-neutral-400 group-focus-within:text-red-400 transition-colors">
                          Physical Address
                        </label>
                        <div className="relative">
                          <div className="absolute left-0 pl-4 pt-4 pointer-events-none">
                            <MapPin className="w-5 h-5 text-neutral-500 group-focus-within:text-red-400 transition-colors" />
                          </div>
                          <textarea
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all resize-none"
                            placeholder="Enter complete facility address"
                            required
                          />
                        </div>
                      </div>

                    </div>

                    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                      <AnimatePresence>
                        {message.text ? (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}
                          >
                            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span className="text-sm font-medium">{message.text}</span>
                          </motion.div>
                        ) : (
                          <div /> // placeholder for flex layout
                        )}
                      </AnimatePresence>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={saving}
                        className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-red-500/20 ${saving
                          ? 'bg-red-500/50 text-white cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-500 text-white'
                          }`}
                      >
                        {saving ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                        {saving ? 'Saving...' : 'Save Changes'}
                      </motion.button>
                    </div>
                  </form>

                  {/* Activity History Section */}
                  <div className="mt-16 pt-10 border-t border-white/10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500/10 rounded-lg">
                          <History className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                          <h3 className={`${outfit.className} text-xl font-bold text-white`}>Update History</h3>
                          <p className="text-neutral-500 text-sm">Review your previous profile modifications.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {logs.length > 0 ? (
                        logs.map((log, index) => (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={log._id}
                            className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-all group"
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-neutral-800 rounded-lg group-hover:bg-rose-500/20 transition-colors">
                                  <Activity className="w-4 h-4 text-rose-400" />
                                </div>
                                <div>
                                  <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-1">
                                    {log.field} Updated
                                  </p>
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-sm text-neutral-400 line-through decoration-rose-500/50">{log.oldValue}</span>
                                    <ArrowRight className="w-3 h-3 text-rose-500" />
                                    <span className="text-sm text-white font-medium">{log.newValue}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-neutral-500">
                                  {new Date(log.timestamp).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
                          <p className="text-neutral-500 text-sm">No recent activity found.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab !== 'profile' && (activeTab === 'security' || activeTab === 'notifications') && (
                <motion.div
                  key="coming-soon"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-24 h-24 mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    {activeTab === 'security' ? (
                      <Shield className="w-10 h-10 text-neutral-500" />
                    ) : (
                      <Bell className="w-10 h-10 text-neutral-500" />
                    )}
                  </div>
                  <h3 className={`${outfit.className} text-2xl font-semibold text-white mb-3`}>
                    Module in Development
                  </h3>
                  <p className="text-neutral-400 max-w-md">
                    The {activeTab === 'security' ? 'Security & Access' : 'Notifications'} module is currently being upgraded for the new HemoHive v2 platform.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
