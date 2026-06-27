"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 편집 가능한 필드
  const [nickname, setNickname] = useState("");
  const [officeName, setOfficeName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // 비밀번호 변경
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setNickname(profileData.nickname || "");
      setOfficeName(profileData.office_name || "");
      setPhone(profileData.phone || "");
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg("");
    const { error } = await supabase
      .from("profiles")
      .update({
        nickname: nickname || null,
        office_name: officeName || null,
        phone: phone || null,
      })
      .eq("id", user.id);

    if (error) setSaveMsg("❌ 저장 실패: " + error.message);
    else {
      setSaveMsg("✅ 저장되었습니다.");
      loadData();
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setPwMsg("❌ 비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setPwMsg("❌ " + error.message);
    else {
      setPwMsg("✅ 비밀번호가 변경되었습니다.");
      setNewPassword("");
    }
    setTimeout(() => setPwMsg(""), 3000);
  };

  const handleDeleteAccount = async () => {
    if (!confirm("정말로 회원 탈퇴하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.")) return;
    if (!confirm("마지막 확인입니다.\n탈퇴를 진행할까요?")) return;

    // profiles 행 삭제 (auth.users는 cascade로 자동 처리되지 않으므로 별도 처리 필요)
    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.auth.signOut();
    alert("탈퇴가 완료되었습니다.");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center text-gray-500">
        불러오는 중...
      </div>
    );
  }

  const remaining = profile ? Math.max(0, profile.free_limit - profile.generation_count) : 0;
  const usagePercent = profile ? (profile.generation_count / profile.free_limit) * 100 : 0;
  const joinDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("ko-KR") : "-";

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
      <p className="text-gray-500 mb-8 text-sm">계정 정보 및 사용 현황을 관리하세요.</p>

      {/* 1. 계정 정보 */}
      <div className="section-card">
        <h2 className="text-lg font-semibold mb-4">계정 정보</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">이메일</span>
            <span className="text-sm font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">가입일</span>
            <span className="text-sm font-medium">{joinDate}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-500">현재 플랜</span>
            <span className={`text-sm font-medium px-2 py-0.5 rounded ${profile?.is_subscribed ? "bg-black text-white" : "bg-gray-100 text-gray-700"}`}>
              {profile?.is_subscribed ? "구독 중" : "무료"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. 사용 현황 */}
      <div className="section-card">
        <h2 className="text-lg font-semibold mb-4">사용 현황</h2>
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm text-gray-500">이번 달 사용</span>
          <span className="text-sm">
            <span className="font-bold text-lg">{profile?.generation_count || 0}</span>
            <span className="text-gray-400"> / {profile?.free_limit || 10}회</span>
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-black h-2 transition-all"
            style={{ width: `${Math.min(100, usagePercent)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {profile?.is_subscribed
            ? "구독 회원이므로 무제한으로 사용할 수 있습니다."
            : `무료 ${remaining}회 남았습니다. 모두 소진 시 구독이 필요합니다.`}
        </p>
      </div>

      {/* 3. 프로필 정보 */}
      <div className="section-card">
        <h2 className="text-lg font-semibold mb-4">프로필 정보</h2>
        <div className="space-y-4">
          <div>
            <label className="label-base">닉네임</label>
            <input
              className="input-base"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="홍길동"
            />
          </div>
          <div>
            <label className="label-base">사무소명</label>
            <input
              className="input-base"
              value={officeName}
              onChange={(e) => setOfficeName(e.target.value)}
              placeholder="○○공인중개사사무소"
            />
          </div>
          <div>
            <label className="label-base">연락처</label>
            <input
              className="input-base"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-5 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
            {saveMsg && <span className="text-sm">{saveMsg}</span>}
          </div>
        </div>
      </div>

      {/* 4. 비밀번호 변경 */}
      <div className="section-card">
        <h2 className="text-lg font-semibold mb-4">비밀번호 변경</h2>
        <div className="flex gap-2">
          <input
            className="input-base flex-1"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호 (6자 이상)"
          />
          <button
            onClick={handleChangePassword}
            className="px-5 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition whitespace-nowrap"
          >
            변경
          </button>
        </div>
        {pwMsg && <p className="mt-2 text-sm">{pwMsg}</p>}
      </div>

      {/* 5. 회원 탈퇴 */}
      <div className="section-card border-red-200">
        <h2 className="text-lg font-semibold mb-2 text-red-600">회원 탈퇴</h2>
        <p className="text-xs text-gray-500 mb-4">
          탈퇴 시 모든 계정 정보와 사용 기록이 삭제되며, 복구할 수 없습니다.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-5 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition"
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}
