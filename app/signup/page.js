"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMsg("❌ " + error.message);
    } else {
      setMsg("✅ 회원가입 완료! 로그인 페이지로 이동합니다...");
      setTimeout(() => router.push("/login"), 1500);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-2">회원가입</h1>
      <p className="text-gray-500 mb-8 text-sm">매물 빨리 빼기에 오신 것을 환영합니다.</p>

      <form onSubmit={handleSignup} className="space-y-4">
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
          <label className="label-base">비밀번호 (6자 이상)</label>
          <input
            className="input-base"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? "처리 중..." : "회원가입"}
        </button>
      </form>

      {msg && <p className="mt-4 text-sm">{msg}</p>}

      <p className="mt-8 text-sm text-gray-500 text-center">
        이미 계정이 있으신가요?{" "}
        <a href="/login" className="text-black font-semibold underline">로그인</a>
      </p>
    </div>
  );
}
