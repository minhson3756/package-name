// Hoán đổi config.json giữa 2 giá trị theo chu kỳ 3 giờ:
//   - 2 giờ dùng GIÁ TRỊ 1
//   - 1 giờ dùng GIÁ TRỊ 2
// Lịch tính theo giờ Việt Nam (UTC+7). Mặc định GIÁ TRỊ 2 chạy trong các khung
// 02h, 05h, 08h, 11h, 14h, 17h, 20h, 23h (mỗi khung kéo dài 1 tiếng).
//
// Chạy thử:  node .github/scripts/toggle-config.mjs           (theo giờ hiện tại)
//            node .github/scripts/toggle-config.mjs 1|2       (ép về giá trị 1 hoặc 2)

import { readFileSync, writeFileSync } from "node:fs";

// ==== Sửa 2 giá trị ở đây ====
const VALUE_1 = {
  packageNames: ["app.pdfconverter.android", "com.xnetheron.qrscanner"],
};

const VALUE_2 = {
  packageNames: [
    "app.pdfconverter.android",
    "com.xnetheron.qrscanner",
    "com.dailymood.tracker.diary",
  ],
};

const CYCLE_HOURS = 3; // 2h giá trị 1 + 1h giá trị 2
const VALUE_2_SLOT = 2; // giờ VN % 3 === 2 => giá trị 2 (đổi 0/1/2 để dời lịch)
const TZ_OFFSET_HOURS = 7; // giờ Việt Nam
// =============================

const CONFIG_PATH = new URL("../../config.json", import.meta.url);

function pickValue() {
  const forced = process.argv[2];
  if (forced === "1") return 1;
  if (forced === "2") return 2;
  const localHour = (new Date().getUTCHours() + TZ_OFFSET_HOURS) % 24;
  return localHour % CYCLE_HOURS === VALUE_2_SLOT ? 2 : 1;
}

const which = pickValue();
const target = which === 2 ? VALUE_2 : VALUE_1;
const next = JSON.stringify(target, null, 2) + "\n";

let current = "";
try {
  current = readFileSync(CONFIG_PATH, "utf8");
} catch {}

let same = false;
try {
  same = JSON.stringify(JSON.parse(current)) === JSON.stringify(target);
} catch {}

if (same) {
  console.log(`config.json đã là giá trị ${which}, không cần đổi.`);
} else {
  writeFileSync(CONFIG_PATH, next);
  console.log(`Đã đổi config.json sang giá trị ${which}.`);
}
