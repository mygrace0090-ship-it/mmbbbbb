"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { formatKoreanMoney, formatPyeong } from "@/lib/formatters";  // ⬅️ 이 줄 추가

export default function Home() {
  const router = useRouter();

  // 매물 종류 (주택/상가)
  const [propertyKind, setPropertyKind] = useState("주택");
  // 거래 유형
  const [dealType, setDealType] = useState("매매");

  // 결과
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 공통: 주소
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");

  // 주택 필드
  const [buildingType, setBuildingType] = useState("아파트");
  const [direction, setDirection] = useState("남향");
  const [exclusiveArea, setExclusiveArea] = useState("");
  const [supplyArea, setSupplyArea] = useState("");
  const [currentFloor, setCurrentFloor] = useState("");
  const [totalFloor, setTotalFloor] = useState("");
  const [roomCount, setRoomCount] = useState("");
  const [bathroomCount, setBathroomCount] = useState("");
  const [deposit, setDeposit] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [maintenanceFee, setMaintenanceFee] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [heatingType, setHeatingType] = useState("개별난방 (도시가스)");
  const [housingParking, setHousingParking] = useState("가능");
  const [petAllowed, setPetAllowed] = useState("협의");
  const houseOptions = ["에어컨", "세탁기", "냉장고", "TV", "인덕션", "전자레인지", "건조기", "식기세척기"];
  const [selectedHouseOptions, setSelectedHouseOptions] = useState([]);

  // 상가 - 업종
  const businessCategories = {
    "휴게음식점": ["카페", "베이커리", "분식", "아이스크림", "패스트푸드", "피자", "기타휴게점"],
    "일반음식점": ["한식", "중식", "일식", "양식", "분식", "치킨", "피자", "고깃집", "횟집", "뷔페", "기타"],
    "주류점": ["호프", "와인바", "칵테일바", "이자카야", "실내포차", "노래주점"],
    "오락스포츠": ["PC방", "노래방", "당구장", "볼링장", "스크린골프", "헬스장", "필라테스", "요가", "격투기", "댄스", "키즈카페"],
    "판매업": ["의류", "신발", "잡화", "화장품", "편의점", "슈퍼마켓", "정육점", "청과", "약국", "안경점", "휴대폰", "꽃집", "문구"],
    "서비스업": ["미용실", "네일샵", "피부관리", "마사지", "세탁소", "부동산", "학원", "병원/의원", "동물병원", "사진관", "인쇄소"],
    "기타업종": ["사무실", "창고", "공장", "무점포", "기타"],
  };
  const [bizMajor, setBizMajor] = useState("휴게음식점");
  const [bizMinor, setBizMinor] = useState("카페");
  const [recommendBiz, setRecommendBiz] = useState("");

  // 상가 면적/층
  const [shopExclusiveArea, setShopExclusiveArea] = useState("");
  const [shopSupplyArea, setShopSupplyArea] = useState("");
  const [shopCurrentFloor, setShopCurrentFloor] = useState("");
  const [shopTotalFloor, setShopTotalFloor] = useState("");

  // 상가 가격
  const [shopDeposit, setShopDeposit] = useState("");
  const [shopMonthlyRent, setShopMonthlyRent] = useState("");

  // 상가 권리금
  const [premiumStatus, setPremiumStatus] = useState("없음");
  const [premiumAmount, setPremiumAmount] = useState("");

  // 상가 관리비
  const [maintenanceStatus, setMaintenanceStatus] = useState("있음");
  const [shopMaintenanceFee, setShopMaintenanceFee] = useState("");
  const maintenanceItems = ["수도", "전기", "가스", "인터넷", "정화조", "공동청소", "공동전기"];
  const [selectedMaintenance, setSelectedMaintenance] = useState([]);

  // 상가 - 유형/상권/화장실/엘리베이터/주차
  const [shopType, setShopType] = useState("1층 상가");
  const [areaType, setAreaType] = useState("역세권");
  const [toiletType, setToiletType] = useState("내부(남녀구분)");
  const [toiletCount, setToiletCount] = useState(1);
  const [elevator, setElevator] = useState("있음");
  const [parking, setParking] = useState("가능");
  const [parkingType, setParkingType] = useState("자주식");
  const [parkingAvailable, setParkingAvailable] = useState("");
  const [parkingTotal, setParkingTotal] = useState("");

  // 상가 매물특징/임차
  const shopFeatures = ["24시간개방", "전속매물", "샵인샵", "인테리어(설비)", "에어컨", "테라스", "루프탑", "창고", "난방기"];
  const [selectedShopFeatures, setSelectedShopFeatures] = useState([]);
  const [tenantStatus, setTenantStatus] = useState("공실");
  const [tenantEndDate, setTenantEndDate] = useState("");
  const [shopMoveInDate, setShopMoveInDate] = useState("");

  // 공통 - 등기 / 위반건축물 / 특이사항
  const [registryStatus, setRegistryStatus] = useState("등기건물");
  const [violationStatus, setViolationStatus] = useState("해당없음");
  const [features, setFeatures] = useState("");

  // 폼 내 중개사 정보 (참고용)
  const [formOfficeName, setFormOfficeName] = useState("");
  const [formPhone, setFormPhone] = useState("");

  // 토글 함수
  const toggleItem = (arr, setArr, item) => {
    setArr(arr.includes(item) ? arr.filter((o) => o !== item) : [...arr, item]);
  };

  // Daum 우편번호
  const openAddressSearch = () => {
    if (typeof window === "undefined" || !window.daum) {
      alert("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: function (data) {
        const fullAddress = data.roadAddress || data.jibunAddress;
        setAddress(fullAddress);
      },
    }).open();
  };

  // 생성 핸들러
  const handleGenerate = async () => {
    // 1. 로그인 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    // 2. 프로필
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("generation_count, free_limit, is_subscribed")
      .eq("id", user.id)
      .single();
    if (profileError) {
      alert("프로필 정보를 불러올 수 없습니다.");
      return;
    }

    // 3. 한도 확인
    const remaining = profile.free_limit - profile.generation_count;
    if (!profile.is_subscribed && remaining <= 0) {
      alert("무료 사용 횟수를 모두 소진했습니다.\n구독 플랜으로 업그레이드해주세요.");
      return;
    }

    // 4. 로딩
    setLoading(true);
    setResult(null);

    // 5. 카운트 차감
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ generation_count: profile.generation_count + 1 })
      .eq("id", user.id);
    if (updateError) {
      alert("사용 횟수 업데이트에 실패했습니다.");
      setLoading(false);
      return;
    }

    // 6. OpenAI 호출
    try {
      // 중개사 정보 (마이페이지 우선, 없으면 폼 입력값)
      const { data: brokerData } = await supabase
        .from("profiles")
        .select("nickname, office_name, phone")
        .eq("id", user.id)
        .single();
      const brokerInfo = {
        nickname: brokerData?.nickname || "",
        officeName: brokerData?.office_name || formOfficeName || "",
        phone: brokerData?.phone || formPhone || "",
      };
        // 금액/면적 변환
const formattedDeposit = formatKoreanMoney(deposit);
const formattedRent = formatKoreanMoney(monthlyRent);
const formattedMaintenance = formatKoreanMoney(maintenanceFee);
const formattedSupplyArea = formatPyeong(supplyArea);
const formattedExclusiveArea = formatPyeong(exclusiveArea);

      // propertyData 동적 생성 (값이 있는 것만)
      const propertyData = {
        매물종류: propertyKind,
        거래유형: dealType,
        주소: address + (addressDetail ? ` ${addressDetail}` : ""),
      };

      if (propertyKind === "주택") {
        if (buildingType) propertyData.건물유형 = buildingType;
        if (direction) propertyData.방향 = direction;
        if (exclusiveArea) propertyData.전용면적 = `${exclusiveArea}㎡`;
        if (supplyArea) propertyData.공급면적 = `${supplyArea}㎡`;
        if (currentFloor && totalFloor) propertyData.층수 = `${currentFloor}층 / ${totalFloor}층`;
        else if (currentFloor) propertyData.층수 = `${currentFloor}층`;
        if (roomCount) propertyData.방개수 = `${roomCount}개`;
        if (bathroomCount) propertyData.욕실개수 = `${bathroomCount}개`;
        if (deposit) propertyData.보증금 = `${deposit}만원`;
        if (monthlyRent && dealType !== "매매") propertyData.월세 = `${monthlyRent}만원`;
        if (maintenanceFee) propertyData.관리비 = `${maintenanceFee}만원`;
        if (moveInDate) propertyData.입주가능일 = moveInDate;
        if (heatingType) propertyData.난방방식 = heatingType;
        propertyData.주차 = housingParking;
        propertyData.반려동물 = petAllowed;
        if (selectedHouseOptions.length > 0) propertyData.기본옵션 = selectedHouseOptions;
      }

      if (propertyKind === "상가") {
        propertyData.업종_대분류 = bizMajor;
        propertyData.업종_중분류 = bizMinor;
        if (recommendBiz) propertyData.추천업종 = recommendBiz;
        if (shopExclusiveArea) propertyData.전용면적 = `${shopExclusiveArea}㎡`;
        if (shopSupplyArea) propertyData.공급면적 = `${shopSupplyArea}㎡`;
        if (shopCurrentFloor && shopTotalFloor) propertyData.층수 = `${shopCurrentFloor}층 / ${shopTotalFloor}층`;
        else if (shopCurrentFloor) propertyData.층수 = `${shopCurrentFloor}층`;
        if (shopDeposit) propertyData.보증금 = `${shopDeposit}만원`;
        if (shopMonthlyRent) propertyData.월세 = `${shopMonthlyRent}만원`;
        propertyData.권리금 = premiumStatus === "있음" && premiumAmount ? `${premiumAmount}만원` : premiumStatus;
        if (maintenanceStatus === "있음") {
          if (shopMaintenanceFee) propertyData.관리비 = `${shopMaintenanceFee}만원`;
          if (selectedMaintenance.length > 0) propertyData.관리비_포함항목 = selectedMaintenance;
        } else {
          propertyData.관리비 = "없음";
        }
        propertyData.상가유형 = shopType;
        propertyData.상권유형 = areaType;
        propertyData.화장실 = `${toiletType} ${toiletCount}개`;
        propertyData.엘리베이터 = elevator;
        if (parking === "가능") {
          propertyData.주차 = `가능 (${parkingType}${parkingAvailable ? `, ${parkingAvailable}대` : ""}${parkingTotal ? ` / 총 ${parkingTotal}대` : ""})`;
        } else {
          propertyData.주차 = "불가능";
        }
        if (selectedShopFeatures.length > 0) propertyData.매물특징 = selectedShopFeatures;
        propertyData.임차상태 = tenantStatus;
        if (tenantStatus === "임차중" && tenantEndDate) propertyData.임차만기일 = tenantEndDate;
        if (shopMoveInDate) propertyData.입주가능일 = shopMoveInDate;
      }

      // 공통
      propertyData.등기여부 = registryStatus;
      propertyData.위반건축물 = violationStatus;
      if (features) propertyData.특이사항_강조포인트 = features;
      // 🔍 진단용 로그
        console.log("📦 AI로 전송되는 propertyData:", propertyData);
        console.log("👤 brokerInfo:", brokerInfo);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyData, brokerInfo }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "생성 실패");

      setResult({ titles: data.titles, body: data.body });
      window.dispatchEvent(new Event("profile-updated"));
    } catch (error) {
      alert("생성 중 오류가 발생했습니다: " + error.message);
      await supabase
        .from("profiles")
        .update({ generation_count: profile.generation_count })
        .eq("id", user.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* 히어로 */}
        <section className="text-center py-12 mb-8">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            부동산 매물 설명, <br />
            <span className="text-gray-400">10초만에 끝내세요.</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            공인중개사를 위한 매물 설명 자동 생성기. 매물 정보만 입력하면 끝.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-10">
            {[
              { n: "01", t: "매물 정보 입력", d: "주소, 면적, 가격 등 정보를 채워주세요" },
              { n: "02", t: "자동 생성 클릭", d: "원하는 플랫폼 톤을 선택하세요" },
              { n: "03", t: "복사해서 사용", d: "결과물을 그대로 매물 등록에 활용하세요" },
            ].map((step) => (
              <div key={step.n} className="border border-gray-200 rounded-xl p-5 text-left">
                <div className="text-xs font-bold text-gray-400 mb-2">{step.n}</div>
                <div className="font-semibold mb-1">{step.t}</div>
                <div className="text-sm text-gray-500">{step.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 자동 생성기 */}
        <section id="generator" className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">매물 정보 입력</h2>
            <p className="text-sm text-gray-500">정확한 정보를 입력할수록 자연스러운 설명이 생성됩니다.</p>
          </div>

          {/* 주택/상가 탭 */}
          <div className="flex gap-2 mb-4">
            {[
              { v: "주택", icon: "🏠" },
              { v: "상가", icon: "🏢" },
            ].map((k) => (
              <button
                key={k.v}
                onClick={() => {
                  setPropertyKind(k.v);
                  setDealType(k.v === "상가" ? "상가" : "매매");
                }}
                className={`flex-1 px-6 py-4 rounded-xl text-base font-bold border-2 transition ${
                  propertyKind === k.v
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-600 border-gray-200 hover:border-black"
                }`}
              >
                {k.icon} {k.v} 매물
              </button>
            ))}
          </div>

          {/* 거래유형 */}
          <div className="section-card">
            <label className="label-base">{propertyKind === "상가" ? "매물 구분 *" : "거래 유형 *"}</label>
            <div className="flex gap-2">
              {(propertyKind === "상가" ? ["상가", "사무실"] : ["매매", "전세", "월세"]).map((type) => (
                <button
                  key={type}
                  onClick={() => setDealType(type)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium border transition ${
                    dealType === type
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-300 hover:border-black"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 주소 */}
          <div className="section-card">
            <label className="label-base">주소 *</label>
            <div className="flex gap-2 mb-2">
              <input
                className="input-base"
                value={address}
                readOnly
                placeholder="주소 검색을 클릭하세요"
              />
              <button
                onClick={openAddressSearch}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition whitespace-nowrap flex items-center gap-1"
              >
                🔍 주소 검색
              </button>
            </div>
            <input
              className="input-base"
              placeholder="상세주소 (동/호수)"
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
            />
          </div>

          {/* ============ 주택 ============ */}
          {propertyKind === "주택" && (
            <>
              <div className="section-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-base">건물 유형 *</label>
                    <select
                      className="input-base"
                      value={buildingType}
                      onChange={(e) => setBuildingType(e.target.value)}
                    >
                      <option>아파트</option>
                      <option>오피스텔</option>
                      <option>빌라/연립</option>
                      <option>단독/다가구</option>
                      <option>원룸/투룸</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-base">방향</label>
                    <select
                      className="input-base"
                      value={direction}
                      onChange={(e) => setDirection(e.target.value)}
                    >
                      <option>남향</option>
                      <option>남동향</option>
                      <option>남서향</option>
                      <option>동향</option>
                      <option>서향</option>
                      <option>북향</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="section-card">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="label-base">전용면적 (㎡)</label>
                    <input
                      className="input-base"
                      type="number"
                      placeholder="59"
                      value={exclusiveArea}
                      onChange={(e) => setExclusiveArea(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-base">공급면적 (㎡)</label>
                    <input
                      className="input-base"
                      type="number"
                      placeholder="84"
                      value={supplyArea}
                      onChange={(e) => setSupplyArea(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-base">해당 층</label>
                    <input
                      className="input-base"
                      type="number"
                      placeholder="10"
                      value={currentFloor}
                      onChange={(e) => setCurrentFloor(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-base">총 층수</label>
                    <input
                      className="input-base"
                      type="number"
                      placeholder="15"
                      value={totalFloor}
                      onChange={(e) => setTotalFloor(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="section-card">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-base">방 개수</label>
                    <input
                      className="input-base"
                      type="number"
                      placeholder="3"
                      value={roomCount}
                      onChange={(e) => setRoomCount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-base">욕실 개수</label>
                    <input
                      className="input-base"
                      type="number"
                      placeholder="2"
                      value={bathroomCount}
                      onChange={(e) => setBathroomCount(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="section-card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label-base">보증금 (만원) *</label>
                    <input
                      className="input-base"
                      type="number"
                      placeholder="50000"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-base">
                      월세 (만원) {dealType === "매매" && <span className="text-gray-400">(해당없음)</span>}
                    </label>
                    <input
                      className="input-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                      type="number"
                      placeholder="80"
                      disabled={dealType === "매매"}
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-base">관리비 (만원)</label>
                    <input
                      className="input-base"
                      type="number"
                      placeholder="10"
                      value={maintenanceFee}
                      onChange={(e) => setMaintenanceFee(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="section-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-base">입주 가능일</label>
                    <input
                      className="input-base"
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-base">난방 방식</label>
                    <select
                      className="input-base"
                      value={heatingType}
                      onChange={(e) => setHeatingType(e.target.value)}
                    >
                      <option>개별난방 (도시가스)</option>
                      <option>중앙난방</option>
                      <option>지역난방</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="section-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-base">주차 가능</label>
                    <div className="flex gap-2">
                      {["가능", "불가", "협의"].map((v) => (
                        <button
                          key={v}
                          onClick={() => setHousingParking(v)}
                          className={`flex-1 px-3 py-2 border rounded-lg text-sm transition ${
                            housingParking === v
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-300 hover:border-black"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label-base">반려동물</label>
                    <div className="flex gap-2">
                      {["가능", "불가", "협의"].map((v) => (
                        <button
                          key={v}
                          onClick={() => setPetAllowed(v)}
                          className={`flex-1 px-3 py-2 border rounded-lg text-sm transition ${
                            petAllowed === v
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-300 hover:border-black"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="section-card">
                <label className="label-base">기본 옵션</label>
                <div className="flex flex-wrap gap-2">
                  {houseOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => toggleItem(selectedHouseOptions, setSelectedHouseOptions, opt)}
                      className={`px-4 py-2 rounded-full text-sm border transition ${
                        selectedHouseOptions.includes(opt)
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-black"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ============ 상가 ============ */}
          {propertyKind === "상가" && (
            <>
              <div className="section-card">
                <label className="label-base">현재 업종 *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">대분류</label>
                    <select
                      className="input-base"
                      value={bizMajor}
                      onChange={(e) => {
                        setBizMajor(e.target.value);
                        setBizMinor(businessCategories[e.target.value][0]);
                      }}
                    >
                      {Object.keys(businessCategories).map((k) => (
                        <option key={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">중분류</label>
                    <select
                      className="input-base"
                      value={bizMinor}
                      onChange={(e) => setBizMinor(e.target.value)}
                    >
                      {businessCategories[bizMajor].map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <label className="label-base">추천 업종 (자유 입력)</label>
                <input
                  className="input-base"
                  placeholder="예: 카페, 디저트, 무인매장 등"
                  value={recommendBiz}
                  onChange={(e) => setRecommendBiz(e.target.value)}
                />
              </div>

              <div className="section-card">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="label-base">전용면적 (㎡)</label>
                    <input
                      className="input-base"
                      type="number"
                      placeholder="33"
                      value={shopExclusiveArea}
                      onChange={(e) => setShopExclusiveArea(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-base">공급면적 (㎡)</label>
                    <input
                      className="input-base"
                      type="number"
                      placeholder="50"
                      value={shopSupplyArea}
                      onChange={(e) => setShopSupplyArea(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-base">해당 층</label>
                    <input
                      className="input-base"
                      type="number"
                      placeholder="1"
                      value={shopCurrentFloor}
                      onChange={(e) => setShopCurrentFloor(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-base">총 층수</label>
                    <input
                      className="input-base"
                      type="number"
                      placeholder="5"
                      value={shopTotalFloor}
                      onChange={(e) => setShopTotalFloor(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="section-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-base">보증금 (만원) *</label>
                    <input
                      className="input-base"
                      type="number"
                      placeholder="3000"
                      value={shopDeposit}
                      onChange={(e) => setShopDeposit(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-base">
                      월세 (만원) {dealType === "매매" && <span className="text-gray-400">(해당없음)</span>}
                    </label>
                    <input
                      className="input-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                      type="number"
                      placeholder="200"
                      disabled={dealType === "매매"}
                      value={shopMonthlyRent}
                      onChange={(e) => setShopMonthlyRent(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="section-card">
                <label className="label-base">권리금 *</label>
                <div className="flex gap-2 mb-3">
                  {["있음", "없음", "협의가능"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setPremiumStatus(v)}
                      className={`flex-1 px-3 py-2 border rounded-lg text-sm transition ${
                        premiumStatus === v
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-black"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                {premiumStatus === "있음" && (
                  <input
                    className="input-base"
                    type="number"
                    placeholder="권리금 (만원)"
                    value={premiumAmount}
                    onChange={(e) => setPremiumAmount(e.target.value)}
                  />
                )}
              </div>

              <div className="section-card">
                <label className="label-base">관리비 *</label>
                <div className="flex gap-3 items-center mb-3">
                  <input
                    className="input-base flex-1"
                    type="number"
                    placeholder="관리비 (만원)"
                    value={shopMaintenanceFee}
                    onChange={(e) => setShopMaintenanceFee(e.target.value)}
                  />
                  <div className="flex gap-2">
                    {["있음", "없음"].map((v) => (
                      <button
                        key={v}
                        onClick={() => setMaintenanceStatus(v)}
                        className={`px-3 py-2 border rounded-lg text-sm transition ${
                          maintenanceStatus === v
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-300 hover:border-black"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                {maintenanceStatus === "있음" && (
                  <>
                    <label className="text-xs text-gray-500 mb-2 block">포함 항목</label>
                    <div className="flex flex-wrap gap-2">
                      {maintenanceItems.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => toggleItem(selectedMaintenance, setSelectedMaintenance, opt)}
                          className={`px-4 py-2 rounded-full text-sm border transition ${
                            selectedMaintenance.includes(opt)
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-300 hover:border-black"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="section-card">
                <label className="label-base">상가 유형</label>
                <div className="flex flex-wrap gap-2">
                  {["1층 상가", "2층 이상", "지하상가", "코너자리", "일반", "상가주택", "근린상가", "단지내상가"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setShopType(v)}
                      className={`px-4 py-2 rounded-full text-sm border transition ${
                        shopType === v
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-black"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="section-card">
                <label className="label-base">상권 유형</label>
                <div className="flex flex-wrap gap-2">
                  {["대학가", "교회", "오피스", "역세권", "번화가", "주택가", "주차 용이"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAreaType(v)}
                      className={`px-4 py-2 rounded-full text-sm border transition ${
                        areaType === v
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-black"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="section-card">
                <label className="label-base">화장실</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">위치/구분</label>
                    <select
                      className="input-base"
                      value={toiletType}
                      onChange={(e) => setToiletType(e.target.value)}
                    >
                      <option>외부(남녀구분)</option>
                      <option>외부(남녀혼용)</option>
                      <option>내부(남녀구분)</option>
                      <option>내부(남녀혼용)</option>
                      <option>정보없음</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">개수</label>
                    <select
                      className="input-base"
                      value={toiletCount}
                      onChange={(e) => setToiletCount(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <option key={n} value={n}>{n}개</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="section-card">
                <label className="label-base">엘리베이터</label>
                <div className="flex gap-2">
                  {["있음", "없음"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setElevator(v)}
                      className={`flex-1 px-3 py-2 border rounded-lg text-sm transition ${
                        elevator === v
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-black"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="section-card">
                <label className="label-base">주차</label>
                <div className="flex gap-2 mb-3">
                  {["가능", "불가능"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setParking(v)}
                      className={`flex-1 px-3 py-2 border rounded-lg text-sm transition ${
                        parking === v
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-black"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                {parking === "가능" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">주차 방식</label>
                      <div className="flex gap-2">
                        {["자주식", "기계식"].map((v) => (
                          <button
                            key={v}
                            onClick={() => setParkingType(v)}
                            className={`flex-1 px-3 py-2 border rounded-lg text-sm transition ${
                              parkingType === v
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-700 border-gray-300 hover:border-black"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">주차 가능 대수</label>
                      <input
                        className="input-base"
                        type="number"
                        placeholder="2"
                        value={parkingAvailable}
                        onChange={(e) => setParkingAvailable(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">총 주차 대수</label>
                      <input
                        className="input-base"
                        type="number"
                        placeholder="20"
                        value={parkingTotal}
                        onChange={(e) => setParkingTotal(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="section-card">
                <label className="label-base">매물 특징</label>
                <div className="flex flex-wrap gap-2">
                  {shopFeatures.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => toggleItem(selectedShopFeatures, setSelectedShopFeatures, opt)}
                      className={`px-4 py-2 rounded-full text-sm border transition ${
                        selectedShopFeatures.includes(opt)
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-black"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="section-card">
                <label className="label-base">현재 임차 상태</label>
                <div className="flex gap-2 mb-3">
                  {["공실", "임차중", "본인 운영"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setTenantStatus(v)}
                      className={`flex-1 px-3 py-2 border rounded-lg text-sm transition ${
                        tenantStatus === v
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-black"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                {tenantStatus === "임차중" && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">임차 만기일</label>
                    <input
                      className="input-base"
                      type="date"
                      value={tenantEndDate}
                      onChange={(e) => setTenantEndDate(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="section-card">
                <label className="label-base">입주 가능일</label>
                <input
                  className="input-base"
                  type="date"
                  value={shopMoveInDate}
                  onChange={(e) => setShopMoveInDate(e.target.value)}
                />
              </div>
            </>
          )}

          {/* 공통: 등기/위반건축물 */}
          <div className="section-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-base">등기부등본</label>
                <div className="flex gap-2">
                  {["등기건물", "미등기건물"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setRegistryStatus(v)}
                      className={`flex-1 px-3 py-2 border rounded-lg text-sm transition ${
                        registryStatus === v
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-black"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label-base">위반건축물 여부</label>
                <div className="flex gap-2">
                  {["해당", "해당없음"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setViolationStatus(v)}
                      className={`flex-1 px-3 py-2 border rounded-lg text-sm transition ${
                        violationStatus === v
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-black"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 특이사항 */}
          <div className="section-card">
            <label className="label-base">매물 특이사항 / 강조 포인트</label>
            <textarea
              className="input-base min-h-[100px] resize-y"
              placeholder="예: 리모델링 완료, 역세권 도보 3분, 학군 우수, 채광 좋음 등"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
            />
          </div>

          {/* 중개사 정보 (마이페이지 우선, 비어 있으면 여기서) */}
          <div className="section-card">
            <label className="label-base font-bold text-base mb-3">중개사 정보</label>
            <p className="text-xs text-gray-500 mb-3">
              💡 마이페이지에 등록된 정보가 우선 사용됩니다. 비어 있을 경우만 아래 입력값이 사용됩니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-base">중개사 사무소명</label>
                <input
                  className="input-base"
                  placeholder="예: 빨리빼기 공인중개사사무소"
                  value={formOfficeName}
                  onChange={(e) => setFormOfficeName(e.target.value)}
                />
              </div>
              <div>
                <label className="label-base">중개사 휴대폰번호</label>
                <input
                  className="input-base"
                  placeholder="010-0000-0000"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 생성 버튼 */}
          <div className="mt-8">
            <button
              onClick={() => handleGenerate()}
              disabled={loading}
              className="w-full px-6 py-5 rounded-xl font-semibold text-base bg-black text-white border-2 border-black hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  매물 설명 생성 중... (약 5~10초)
                </span>
              ) : (
                "✨ 매물 설명 생성하기"
              )}
            </button>
            <p className="text-xs text-gray-500 mt-3">
              ※ 생성 1회당 1회 차감됩니다. 무료 회원은 월 10회까지 이용 가능합니다.
            </p>
          </div>

          {/* 결과 */}
          {result && (
            <div className="mt-8 bg-white border-2 border-black rounded-xl p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h3 className="font-bold text-lg">📝 생성 결과</h3>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleGenerate()}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:border-black transition"
                  >
                    🔄 재생성 (1회 차감)
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.titles.join("\n"))}
                    className="px-4 py-2 text-sm border border-gray-700 rounded-lg hover:bg-gray-100 transition"
                  >
                    📋 제목 복사
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.body)}
                    className="px-4 py-2 text-sm border border-gray-700 rounded-lg hover:bg-gray-100 transition"
                  >
                    📋 본문 복사
                  </button>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `[추천 제목]\n${result.titles.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n[매물 설명]\n${result.body}`
                      )
                    }
                    className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    📋 전체 복사
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded">📌 추천 제목</span>
                  <span className="text-xs text-gray-500">마음에 드는 제목을 클릭하면 복사됩니다</span>
                </div>
                <div className="space-y-2">
                  {result.titles.map((title, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigator.clipboard.writeText(title)}
                      className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-black rounded-lg text-sm transition flex items-center justify-between group"
                    >
                      <span>
                        <span className="font-bold text-gray-400 mr-3">{idx + 1}</span>
                        {title}
                      </span>
                      <span className="text-xs text-gray-400 group-hover:text-black">클릭하여 복사</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded">📝 매물 설명</span>
                </div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {result.body}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
