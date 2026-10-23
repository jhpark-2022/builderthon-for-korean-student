"use client";

import { seoulCampuses } from "@/data/naru";
import ShapeCampuses from "@/components/shared/ShapeCampuses";

/** 서울 안의 대학교 휘장(DECIDED 2026-10-22, data/naru.ts seoulCampuses). 그리는 법은 components/shared/ShapeCampuses.tsx. */
export default function SeoulCampuses() {
  return <ShapeCampuses id="seoul-campuses" campuses={seoulCampuses} />;
}
