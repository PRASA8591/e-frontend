import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, Info, ShieldAlert, Sparkles, Check, Trash } from 'lucide-react';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error reading notification:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error reading all notifications:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'expiry':
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'feature':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer shrink-0"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full leading-none animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Dropdown Pane */}
      {isOpen && (
        <div className="fixed md:absolute top-20 md:top-auto left-4 right-4 md:left-auto md:right-0 mt-2.5 w-auto md:w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-96">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
            <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">Notifications</span>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-[10px] font-extrabold text-prasatek-primary dark:text-green-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto hide-scroll p-2 space-y-1.5">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-35" />
                <p className="font-bold text-xs uppercase tracking-wide">Clean Inbox</p>
                <p className="text-[10px] text-slate-400 mt-1">No alerts or announcements.</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif._id}
                  onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                  className={`p-3 rounded-xl border flex gap-3 cursor-pointer transition ${
                    notif.read 
                      ? 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 opacity-60' 
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 shadow-sm'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getNotificationIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs text-slate-800 dark:text-slate-200 truncate ${!notif.read ? 'font-extrabold' : 'font-bold'}`}>
                      {notif.title}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-normal mt-1 break-words">
                      {notif.message}
                    </p>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 block font-semibold">
                      {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
