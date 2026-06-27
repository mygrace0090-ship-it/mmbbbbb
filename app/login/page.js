"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMsg("❌ " + error.message);
    } else {
      setMsg("✅ 로그인 성공!");
      setTimeout(() => router.push("/"), 800);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-2">로그인</h1>
      <p className="text-gray-500 mb-8 text-sm">매물 설명을 자동으로 생성해보세요.</p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="label-base">이메일</label>
          <input
            className="input-base"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="label-base">비밀번호</label>
          <input
            className="input-base"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? "처리 중..." : "로그인"}
        </button>
      </form>

      {msg && <p className="mt-4 text-sm">{msg}</p>}

      <p className="mt-8 text-sm text-gray-500 text-center">
        아직 계정이 없으신가요?{" "}
        <a href="/signup" className="text-black font-semibold underline">회원가입</a>
      </p>
    </div>
  );
}
