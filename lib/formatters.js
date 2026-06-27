// 만원 단위 숫자를 한국식 금액 표기로 변환
// 입력 예: 50000 (=5억), 2000 (=2,000만원), 25000 (=2억 5,000만원)
export function formatKoreanMoneyFromMan(manNum) {
  if (!manNum || isNaN(manNum)) return "";
  const n = Number(String(manNum).replace(/[^0-9]/g, ""));
  if (n === 0) return "";

  const eok = Math.floor(n / 10000);       // 억 단위 (만원 기준 10000만원 = 1억)
  const man = n % 10000;                    // 만 단위

  let result = "";
  if (eok > 0) result += `${eok}억`;
  if (man > 0) {
    if (result) result += " ";
    result += `${man.toLocaleString()}만`;
  }
  return result ? result + "원" : "";
}

// 원 단위 숫자 → 한국식 표기 (필요시 사용)
export function formatKoreanMoney(num) {
  if (!num || isNaN(num)) return "";
  const n = Number(String(num).replace(/[^0-9]/g, ""));
  if (n === 0) return "";

  const eok = Math.floor(n / 100000000);
  const man = Math.floor((n % 100000000) / 10000);

  let result = "";
  if (eok > 0) result += `${eok}억`;
  if (man > 0) {
    if (result) result += " ";
    result += `${man.toLocaleString()}만`;
  }
  return result ? result + "원" : "";
}

// ㎡를 평수로 환산 (1평 = 3.3058㎡)
export function formatPyeong(squareMeter) {
  if (!squareMeter || isNaN(squareMeter)) return "";
  const sqm = Number(String(squareMeter).replace(/[^0-9.]/g, ""));
  if (sqm === 0) return "";
  const pyeong = Math.round(sqm / 3.3058);
  return `${pyeong}평`;
}
