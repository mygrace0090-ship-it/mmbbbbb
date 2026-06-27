import "./globals.css";
import HeaderAuth from "./HeaderAuth";

export const metadata = {
  title: "매물 빨리 빼기 | 부동산 매물 설명 자동 생성기",
  description: "공인중개사를 위한 매물 설명 자동 생성 서비스",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">매</span>
              </div>
              <span className="font-bold text-lg tracking-tight">매물 빨리 빼기</span>
            </a>
            <HeaderAuth />
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-t border-gray-200 mt-20 py-8">
          <div className="max-w-6xl mx-auto px-6 text-sm text-gray-500">
            © 2026 매물 빨리 빼기. 공인중개사를 위한 매물 설명 자동 생성 서비스.
          </div>
        </footer>
      </body>
    </html>
  );
}
