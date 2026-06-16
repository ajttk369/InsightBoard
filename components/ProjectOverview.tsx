const overviewItems = [
  [
    "문제 정의",
    "CSV 매출 데이터는 표 형태로만 보면 흐름과 우선순위를 빠르게 파악하기 어렵습니다. 숫자를 비교하고 필터링하는 과정도 반복 작업이 됩니다.",
  ],
  [
    "해결 방식",
    "업로드된 데이터를 즉시 집계하고 KPI, 차트, 필터링 테이블, 인사이트 카드로 나눠 보여주도록 구성했습니다.",
  ],
  [
    "개인 구현 범위",
    "서비스 기획, UI 설계, CSV 파싱, KPI 계산, 차트 시각화, 필터링 테이블, CSV 다운로드, 리포트 저장, 반응형 UI를 직접 구현했습니다.",
  ],
  [
    "주요 기능",
    "CSV 업로드, 샘플 데이터 체험, KPI 카드, 차트 대시보드, 데이터 인사이트, 필터링 테이블, CSV 다운로드, 리포트 저장",
  ],
  ["기술 스택", "Next.js, TypeScript, Tailwind CSS, Recharts, Vercel"],
  ["구현 포인트", "백엔드 없이 브라우저에서 CSV를 처리하고, 필터 조건에 따라 모든 지표와 차트가 같은 기준으로 갱신되도록 설계했습니다."],
];

export function ProjectOverview() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm">
      <div className="mb-7">
        <p className="text-sm font-bold text-emerald-700">포트폴리오 섹션</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">프로젝트 설명</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          데이터 업로드부터 지표 계산, 시각화, 리포트 저장까지 이어지는 대시보드 흐름을 한 화면에 담았습니다.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {overviewItems.map(([title, body]) => (
          <div key={title} className="rounded-xl border border-stone-100 bg-stone-50 p-5">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
