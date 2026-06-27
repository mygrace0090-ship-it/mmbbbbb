"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalGenerations: 0,
    subscribedUsers: 0,
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // admin 권한 확인
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      alert("관리자만 접근 가능합니다.");
      router.push("/");
      return;
    }

    setIsAdmin(true);
    await loadUsers();
    setLoading(false);
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setUsers(data || []);

    // 통계 계산
    const totalUsers = data?.length || 0;
    const subscribedUsers = data?.filter((u) => u.is_subscribed).length || 0;
    const activeUsers = data?.filter((u) => u.generation_count > 0).length || 0;
    const totalGenerations = data?.reduce((sum, u) => sum + (u.generation_count || 0), 0) || 0;

    setStats({ totalUsers, activeUsers, totalGenerations, subscribedUsers });
  };

  const handleResetCount = async (userId, email) => {
    if (!confirm(`${email}의 사용 횟수를 0으로 리셋하시겠습니까?`)) return;
    const { error } = await supabase
      .from("profiles")
      .update({ generation_count: 0 })
      .eq("id", userId);
    if (error) alert("실패: " + error.message);
    else {
      alert("리셋 완료!");
      loadUsers();
    }
  };

  const handleToggleSubscription = async (userId, current, email) => {
    const newValue = !current;
    if (!confirm(`${email}의 구독 상태를 ${newValue ? "구독중" : "무료"}로 변경하시겠습니까?`)) return;
    const { error } = await supabase
      .from("profiles")
      .update({ is_subscribed: newValue })
      .eq("id", userId);
    if (error) alert("실패: " + error.message);
    else {
      alert("변경 완료!");
      loadUsers();
    }
  };

  const handleChangeLimit = async (userId, email) => {
    const newLimit = prompt(`${email}의 무료 사용 한도를 입력하세요 (현재 기본: 10)`);
    if (!newLimit || isNaN(parseInt(newLimit))) return;
    const { error } = await supabase
      .from("profiles")
      .update({ free_limit: parseInt(newLimit) })
      .eq("id", userId);
    if (error) alert("실패: " + error.message);
    else {
      alert("변경 완료!");
      loadUsers();
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-gray-500">
        불러오는 중...
      </div>
    );
  }

  if (!isAdmin) return null;

  // 검색 필터
  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.nickname?.toLowerCase().includes(search.toLowerCase()) ||
    u.office_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">👑 관리자 대시보드</h1>
          <p className="text-gray-500 text-sm mt-1">사용자 및 서비스 운영 현황</p>
        </div>
        <button
          onClick={loadUsers}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:border-black transition"
        >
          🔄 새로고침
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">전체 사용자</p>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
          <p className="text-xs text-gray-400 mt-1">명</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">활성 사용자</p>
          <p className="text-3xl font-bold">{stats.activeUsers}</p>
          <p className="text-xs text-gray-400 mt-1">1회 이상 사용</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">유료 구독자</p>
          <p className="text-3xl font-bold text-green-600">{stats.subscribedUsers}</p>
          <p className="text-xs text-gray-400 mt-1">명</p>
        </div>
        <div className="bg-black text-white rounded-xl p-5">
          <p className="text-xs text-gray-300 mb-1">총 생성 횟수</p>
          <p className="text-3xl font-bold">{stats.totalGenerations}</p>
          <p className="text-xs text-gray-300 mt-1">예상 비용 ≈ ₩{Math.round(stats.totalGenerations * 5)}</p>
        </div>
      </div>

      {/* 검색 */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이메일, 닉네임, 사무소명 검색..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
        />
      </div>

      {/* 사용자 테이블 */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">이메일</th>
                <th className="px-4 py-3 text-left font-semibold">닉네임</th>
                <th className="px-4 py-3 text-left font-semibold">사무소</th>
                <th className="px-4 py-3 text-left font-semibold">연락처</th>
                <th className="px-4 py-3 text-center font-semibold">사용/한도</th>
                <th className="px-4 py-3 text-center font-semibold">플랜</th>
                <th className="px-4 py-3 text-left font-semibold">가입일</th>
                <th className="px-4 py-3 text-center font-semibold">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{u.email}</span>
                      {u.is_admin && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">ADMIN</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{u.nickname || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{u.office_name || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{u.phone || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-semibold ${u.generation_count >= u.free_limit ? "text-red-600" : ""}`}>
                      {u.generation_count}
                    </span>
                    <span className="text-gray-400"> / {u.free_limit}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded ${u.is_subscribed ? "bg-black text-white" : "bg-gray-100 text-gray-700"}`}>
                      {u.is_subscribed ? "구독중" : "무료"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("ko-KR") : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => handleResetCount(u.id, u.email)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                        title="사용횟수 0으로 리셋"
                      >
                        🔄
                      </button>
                      <button
                        onClick={() => handleChangeLimit(u.id, u.email)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                        title="한도 변경"
                      >
                        ⚙️
                      </button>
                      <button
                        onClick={() => handleToggleSubscription(u.id, u.is_subscribed, u.email)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                        title="구독 상태 토글"
                      >
                        {u.is_subscribed ? "🔓" : "🔒"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-gray-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 액션 가이드 */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
        <p className="font-semibold mb-2">💡 관리 버튼 사용법</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>🔄 사용횟수 리셋: 무료 사용 카운트를 0으로 초기화</li>
          <li>⚙️ 한도 변경: 무료 사용 한도를 자유롭게 조정 (예: 100, 999)</li>
          <li>🔓/🔒 구독 토글: 구독자 상태 강제 변경 (테스트용)</li>
        </ul>
      </div>
    </div>
  );
}
