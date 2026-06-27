// Kakao 로컬 API: 주소 → 가장 가까운 지하철역 검색

const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY;

// 1. 주소 → 좌표 변환 (Geocoding)
async function getCoordinates(address) {
  if (!address || !KAKAO_API_KEY) {
    console.log("⚠️ 주소 또는 API 키 없음");
    return null;
  }

  try {
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
    });

    if (!res.ok) {
      console.error("❌ Kakao 주소 검색 실패:", res.status);
      return null;
    }

    const data = await res.json();
    if (!data.documents || data.documents.length === 0) {
      console.log("⚠️ 주소 검색 결과 없음:", address);
      return null;
    }

    const { x, y } = data.documents[0]; // x=경도(lng), y=위도(lat)
    return { lng: parseFloat(x), lat: parseFloat(y) };
  } catch (error) {
    console.error("❌ 좌표 변환 오류:", error);
    return null;
  }
}

// 2. 좌표 → 반경 1.5km 내 가장 가까운 지하철역 검색
async function findNearestStation(lng, lat) {
  if (!KAKAO_API_KEY) return null;

  try {
    // 카테고리 SW8 = 지하철역
    const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=SW8&x=${lng}&y=${lat}&radius=1500&sort=distance`;
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
    });

    if (!res.ok) {
      console.error("❌ Kakao 카테고리 검색 실패:", res.status);
      return null;
    }

    const data = await res.json();
    if (!data.documents || data.documents.length === 0) {
      console.log("⚠️ 주변 지하철역 없음");
      return null;
    }

    const nearest = data.documents[0];
    const distance = parseInt(nearest.distance); // 미터

    // 도보 시간 계산 (성인 평균 도보 속도: 분당 67m)
    const walkMinutes = Math.max(1, Math.round(distance / 67));

    // 역 이름 정리 ("○○역"으로 끝나도록)
    let stationName = nearest.place_name;
    if (!stationName.endsWith("역")) stationName += "역";

    return {
      name: stationName,
      distance: distance,
      walkMinutes: walkMinutes,
    };
  } catch (error) {
    console.error("❌ 지하철역 검색 오류:", error);
    return null;
  }
}

// 3. 통합 함수: 주소 입력 → 가장 가까운 역 정보 반환
export async function getNearestStationByAddress(address) {
  if (!address) return null;

  const coords = await getCoordinates(address);
  if (!coords) return null;

  const station = await findNearestStation(coords.lng, coords.lat);
  if (!station) return null;

  return {
    name: station.name,
    walkMinutes: station.walkMinutes,
    distance: station.distance,
    description: `${station.name} 도보 ${station.walkMinutes}분`,
  };
}
