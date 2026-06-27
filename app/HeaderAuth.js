"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function HeaderAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadProfile(data.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
    });

    const handleProfileUpdate = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) loadProfile(data.user.id);
    };
    window.addEventListener("profile-updated", handleProfileUpdate);

    // 드롭다운 외부 클릭 시 닫기
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("profile-updated", handleProfileUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadProfile = async (uid) => {
    const { data } = await supabase
      .from("profiles")
      .select("generation_count, free_limit, is_subscribed, is_admin")
      .eq("id", uid)
      .single();
    setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (!user) {
    return (
      <nav className="flex items-center gap-2">
        <a href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black transition">
          로그인
        </a>
        <a href="/signup" className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition">
          회원가입
        </a>
      </nav>
    );
  }

  const remaining = profile ? Math.max(0, profile.free_limit - profile.generation_count) : "...";

  return (
    <nav className="flex items-center gap-3">
      <span className="text-xs text-gray-500 hidden md:inline">
        {profile?.is_subscribed ? "구독 중" : `무료 ${remaining}회 남음`}
      </span>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:border-black transition"
        >
          <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs">
            {user.email[0].toUpperCase()}
          </span>
          <span className="hidden md:inline">{user.email}</span>
          <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-500">로그인 계정</p>
              <p className="text-sm font-medium truncate">{user.email}</p>
            </div>
            <a
              href="/mypage"
              className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition"
              onClick={() => setOpen(false)}
            >
              👤 마이페이지
            </a>
            <a
              href="/mypage"
              className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition"
              onClick={() => setOpen(false)}
            >
              💳 구독 관리
            </a>
            {profile?.is_admin && (
  <a
    href="/admin"
    className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition bg-yellow-50"
    onClick={() => setOpen(false)}
  >
    👑 관리자 대시보드
  </a>
)}

            <div className="border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition text-red-600"
              >
                🚪 로그아웃
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
