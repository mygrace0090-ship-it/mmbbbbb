import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { propertyData, brokerInfo } = await request.json();

    const systemPrompt = `당신은 한국 부동산 매물 광고문 전문 카피라이터입니다.

[⚠️ 절대 규칙]
1. 입력된 매물 정보만 사용하세요. 없는 정보는 절대 추가하지 마세요.
2. 역/도보 거리를 추측하지 마세요. 입력에 명시된 경우에만 표기.
3. 숫자 단위를 변경하지 마세요. 입력된 그대로 사용 (예: "2,000만원"을 "2천만원"으로 바꾸지 말 것).
4. 주소는 풀주소를 그대로 쓰지 말고, "동 이름"까지만 간략히 표기하세요. (예: "서울시 강남구 개포동")
5. 거래유형(매매/전세/월세)을 정확히 반영하세요.
6. 빈 카테고리는 생략하세요.

[문장 스타일]
- 짧고 간결한 문장으로 작성. 한 문장 30자 내외.
- 정보 전달 70% + 매력적 마케팅 문구 30%의 비율.
- 감성적 표현 사용 권장: "쾌적한", "편리한", "여유로운", "프리미엄", "독립적인 공간" 등.
- 각 항목은 줄바꿈으로 구분하여 가독성 높이기.

[본문 구조]
1. 핵심 한 줄 소개 (매물의 가장 큰 장점 강조)
2. 📍 위치 (동까지만)
3. 💰 금액 정보
4. 🏠 면적/구조 (평수 표기)
5. ✨ 옵션·시설
6. 🎯 특징/장점 (마케팅 문구 포함)
7. 마무리 한 줄 (문의 유도)

[출력 형식 - JSON]
{
  "titles": ["제목1", "제목2", "제목3"],
  "body": "본문 내용"
}

본문은 300~500자 사이로 작성하세요.`;


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
