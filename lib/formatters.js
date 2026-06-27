// 숫자를 한국식 금액 표기로 변환
// 예: 20000000 → "2,000만원", 250000000 → "2억 5,000만원", 1500000000 → "15억"
export function formatKoreanMoney(num) {
  if (!num || isNaN(num)) return "";
  const n = Number(String(num).replace(/[^0-9]/g, ""));
  if (n === 0) return "0원";

  const eok = Math.floor(n / 100000000);        // 억 단위
  const man = Math.floor((n % 100000000) / 10000); // 만 단위
  const won = n % 10000;                          // 원 단위

  let result = "";
  if (eok > 0) result += `${eok}억`;
  if (man > 0) {
    if (result) result += " ";
    result += `${man.toLocaleString()}만`;
  }
  if (won > 0) {
    if (result) result += " ";
    result += `${won.toLocaleString()}`;
  }
  return result ? result + "원" : "0원";
}

// ㎡를 평수로 환산 (1평 = 3.3058㎡)
// 예: 84 → "25평", 33.06 → "10평"
export function formatPyeong(squareMeter) {
  if (!squareMeter || isNaN(squareMeter)) return "";
  const sqm = Number(String(squareMeter).replace(/[^0-9.]/g, ""));
  if (sqm === 0) return "";
  const pyeong = Math.round(sqm / 3.3058);
  return `${pyeong}평`;
}
