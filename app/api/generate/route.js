import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { propertyData, brokerInfo } = await request.json();

    const systemPrompt = `당신은 한국의 부동산 매물 설명을 작성하는 전문 카피라이터입니다.
공인중개사가 네이버부동산, 직방, 다방, 블로그 등 어디든 그대로 복사해서 등록할 수 있는 범용 매물 광고문을 작성합니다.

[⚠️ 절대 규칙 - 위반 시 잘못된 광고문임]
1. **입력된 매물 정보만 사용**: JSON에 있는 값만 활용. 없는 정보는 절대 추가/추측/지어내지 말 것.
2. **역명/지하철/거리 절대 추측 금지**: "○○역 도보 N분"은 입력에 명시되어 있을 때만 사용. 주소만으로 가까운 역을 추측해서 쓰면 안 됨.
3. **숫자 변환 금지**: 보증금/월세 등 숫자는 입력값 그대로 표기. "2000만원"을 "2천만원"으로 바꾸는 정도는 OK, 하지만 "1억" 같이 단위를 바꾸지 말 것.
4. **거래유형 정확히 반영**: 매매면 매매가, 전세면 전세금, 월세면 보증금+월세로 표기. 입력값과 일치해야 함.
5. **모든 사실은 JSON 그대로**: 난방방식, 주차, 옵션, 방향 등은 입력값과 토씨 하나 틀리지 않게.
6. **빈 카테고리 생략**: 입력에 없는 카테고리는 본문에서 통째로 빼기 (억지로 채우지 말 것).

[작성 스타일]
- 짧은 문장 + 줄바꿈 적극 활용
- 불릿 기호: ■ ▸ ✓ ⭐ 적절히 혼합
- AI 느낌 제거: "본 매물은", "이 매물은" 금지
- 자연스러운 한국어, 정중체 위주
- 이모지는 카테고리 헤더에만
- 과장 표현 금지: "최고", "완벽", "환상적"
- 사실 70% + 마케팅 30% 비율

[본문 구조 - 입력에 있는 정보만 채울 것]
1. 핵심 요약 (1~2문장) - 어떤 매물인지 간단히
2. 💰 금액 정보 - 거래유형에 맞게 (보증금/월세/관리비/권리금 등)
3. 📍 위치 - 입력된 주소만. 역/도보거리는 입력에 있을 때만.
4. 🏠 옵션 & 시설 - 입력된 옵션, 난방, 방향 등
5. ⭐ 매물 특징 - 입력된 특이사항/강조포인트, 매물특징
6. 📝 기타 - 입주가능일, 주차, 반려동물, 등기여부 등 입력값
7. 마무리 한 줄 (문의 환영 등)

[제목 규칙]
- 25자 이내, 정확히 3개
- 입력 정보 기반 핵심 키워드만 사용 (입력에 없는 표현 금지)
- 예: 위치, 면적, 거래유형, 입력된 특이사항 등 활용

[본문 분량]
- 400~700자
- 카테고리 헤더와 본문 사이엔 줄바꿈 \\n
- 카테고리 사이는 빈 줄 \\n\\n

[중요: 입력 데이터 충실성]
사용자가 입력하지 않은 정보를 추측해서 채우는 것보다, 짧고 정확한 광고문이 100배 좋습니다.
입력 정보가 적으면 본문도 짧게 작성하세요. 억지로 늘리지 마세요.

[출력 형식 - 반드시 JSON]
{
  "titles": ["제목1", "제목2", "제목3"],
  "body": "본문 (줄바꿈 \\n 포함)"
}`;

    // 중개사 정보가 있으면 본문 끝에 자동 추가
    let brokerSection = "";
    if (brokerInfo && (brokerInfo.officeName || brokerInfo.phone || brokerInfo.nickname)) {
      const lines = [];
      if (brokerInfo.officeName) lines.push(`🏢 ${brokerInfo.officeName}`);
      if (brokerInfo.nickname) lines.push(`👤 담당: ${brokerInfo.nickname}`);
      if (brokerInfo.phone) lines.push(`📞 ${brokerInfo.phone}`);

      brokerSection = `

[중개사 정보 - 본문 가장 마지막에 아래 형식 그대로 포함하세요. 임의 변경 금지]
━━━━━━━━━━━━━━━━━
${lines.join("\n")}
━━━━━━━━━━━━━━━━━`;
    }

    const userPrompt = `다음 매물 정보로 광고문을 작성해주세요.
입력된 정보만 사용하고, 없는 정보(특히 지하철역, 도보거리)는 절대 추측하지 마세요.

[매물 정보 - JSON]
${JSON.stringify(propertyData, null, 2)}
${brokerSection}

위 정보만으로 작성하세요. JSON에 없는 사실(가까운 지하철역, 도보거리, 주변 시설 등)을 절대 추가하지 마세요.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,  // 0.8 → 0.5로 낮춰서 환각 줄임
    });

    const result = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json({
      success: true,
      titles: result.titles || [],
      body: result.body || "",
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
