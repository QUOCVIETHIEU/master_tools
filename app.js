const buildingTypeOptions = [
  { value: "residential", label: "Nhà ở, chung cư để ở", thdiInitial: 10, mvaBand: [0.3, 0.4], family: "building" },
  { value: "office", label: "Building văn phòng, trường học", thdiInitial: 12, mvaBand: [0.3, 0.4], family: "building" },
  { value: "commercial", label: "Trung tâm thương mại, bệnh viện", thdiInitial: 20, mvaBand: [0.3, 0.4], family: "building" },
  { value: "data-center", label: "Data center", thdiInitial: 22, mvaBand: [0.3, 0.4], family: "building" },
  { value: "server-room", label: "Phòng server lớn", thdiInitial: 22, mvaBand: [0.3, 0.4], family: "building" },
  { value: "mechanical-factory", label: "Nhà máy cơ khí thông thường", thdiInitial: 20, mvaBand: [0.4, 0.5], family: "factory" },
  { value: "plastic-factory", label: "Nhà máy nhựa, bao bì", thdiInitial: 25, mvaBand: [0.4, 0.5], family: "factory" },
  { value: "textile-factory", label: "Nhà máy dệt, may", thdiInitial: 20, mvaBand: [0.4, 0.5], family: "factory" },
  { value: "food-factory", label: "Nhà máy thực phẩm, thủy sản", thdiInitial: 20, mvaBand: [0.4, 0.5], family: "factory" },
  { value: "cement-mining", label: "Nhà máy xi măng, khai khoáng", thdiInitial: 28, mvaBand: [0.5, 0.6], family: "heavy" },
  { value: "steel-factory", label: "Nhà máy thép, luyện kim", thdiInitial: 35, mvaBand: [0.5, 0.6], family: "heavy" },
  { value: "arc-furnace", label: "Lò hồ quang, lò cảm ứng lớn", thdiInitial: 40, mvaBand: [0.5, 0.6], family: "heavy" }
];

const loadImportanceOptions = [
  {
    value: "I",
    label: "Nhóm I - Không quan trọng",
    advice: "Tải nhóm I: THDu < 8%; THDi không quá nghiêm ngặt. Phù hợp tải phụ không quan trọng, có thể dừng ngay khi mất điện."
  },
  {
    value: "II",
    label: "Nhóm II - Quan trọng thấp",
    advice: "Tải nhóm II: THDu < 8%; THDi không quá nghiêm ngặt; PF > 0.9. Tủ tụ bù kết kết hợp reactor nếu tỉ lệ VFD ≥ 15%."
  },
  {
    value: "III",
    label: "Nhóm III - Quan trọng",
    advice: "Tải nhóm III: THDu < 5%; PF > 0.95. Đề xuất sử dụng tủ tụ bù kết hợp reactor, có thể cân nhắc thêm AHF lọc sóng hài."
  },
  {
    value: "IV",
    label: "Nhóm IV - Rất quan trọng",
    advice: "Tải nhóm IV: THDu < 5%; PF > 0.95. Kiểm soát chặt chẽ sóng hài theo chuẩn IEEE 519. Sử dụng AHF, SVG, Tụ bù + cuộn kháng và giám sát PQ."
  },
  {
    value: "V",
    label: "Nhóm V - Đặc biệt quan trọng",
    advice: "Tải nhóm V: THDu 3% ÷ 5%; PF > 0.95. Bắt buộc kiểm soát chất lượng điện năng nghiêm ngặt. Sử dụng AHF, SVG, Tụ bù + cuộn kháng, ATS/Hòa đồng bộ và giám sát PQ liên tục."
  }
];

const loadGroups = [
  { id: 1, name: "Motor chạy trực tiếp (DOL/Star-Delta)", power: 120, ks: 0.9 },
  { id: 2, name: "Biến tần VFD 6 xung (6-Pulse VFD)", power: 180, ks: 0.85 },
  { id: 3, name: "Biến tần VFD 12 xung (12-Pulse VFD)", power: 60, ks: 0.8 },
  { id: 4, name: "Bộ lưu điện UPS 6 xung", power: 80, ks: 0.95 },
  { id: 5, name: "Bộ lưu điện UPS 12 xung", power: 0, ks: 0.9 },
  { id: 6, name: "Chỉnh lưu AC/DC 6 xung (Rectifier)", power: 30, ks: 0.75 },
  { id: 7, name: "Chỉnh lưu AC/DC 12 xung (Rectifier)", power: 0, ks: 0.75 },
  { id: 8, name: "Lò cảm ứng / Lò hồ quang lớn", power: 0, ks: 0.8 },
  { id: 9, name: "Máy hàn điện / Robot hàn", power: 45, ks: 0.6 },
  { id: 10, name: "Thiết bị LED / SMPS / Server máy tính", power: 140, ks: 0.9 },
  { id: 11, name: "Hệ thống Chiller / AHU / Bơm / Quạt biến tần", power: 110, ks: 0.88 },
  { id: 12, name: "Trạm sạc xe điện EV Charger", power: 35, ks: 0.75 }
];

const elements = {};
let latestReport = null;
let latestBlockingIssues = [];
let latestRuntimeError = "";
let exportAttempted = false;
let regularFontBase64 = null;
let boldFontBase64 = null;
const assetDataUrlCache = new Map();

function setExportState({ ready, title, items = [], tone = "pending" }) {
  if (elements.exportPdfButton) {
    elements.exportPdfButton.disabled = !ready;
  }
  if (elements.exportWordButton) {
    elements.exportWordButton.disabled = !ready;
  }
  if (elements.reportStatusBanner) {
    elements.reportStatusBanner.hidden = false;
    elements.reportStatusBanner.className = `report-status report-status--${tone}`;
  }
  if (elements.reportStatusTitle) {
    elements.reportStatusTitle.textContent = title;
  } else if (elements.reportStatusBanner) {
    const titleNode = elements.reportStatusBanner.querySelector(".report-status__title");
    if (titleNode) titleNode.textContent = title;
  }
  if (elements.reportStatusList) {
    elements.reportStatusList.innerHTML = items.length
      ? items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
      : "<li>Không có ghi chú bổ sung.</li>";
  }
}

function hideExportState() {
  if (elements.reportStatusBanner) {
    elements.reportStatusBanner.hidden = true;
  }
}

function showExportIssues(kind = "pdf") {
  exportAttempted = true;

  if (latestRuntimeError) {
    setExportState({
      ready: false,
      title: "Không thể tạo báo cáo do lỗi xử lý dữ liệu",
      items: [
        "Trang đang có lỗi nội bộ khi tính toán.",
        "Hãy tải lại trang. Nếu vẫn còn, mở Console để xem lỗi chi tiết.",
        `Chi tiết: ${latestRuntimeError}`
      ],
      tone: "error"
    });
    return;
  }

  setExportState({
    ready: false,
    title: `Chưa thể xuất báo cáo ${kind.toUpperCase()}`,
    items: latestBlockingIssues.length
      ? latestBlockingIssues
      : ["Cần nhập đủ dữ liệu hợp lệ trước khi xuất báo cáo."],
    tone: "pending"
  });
}

function round(value, decimals = 2) {
  return Number.isFinite(value) ? Number(value.toFixed(decimals)) : 0;
}

function formatNumber(value, decimals = 2) {
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(Number.isFinite(value) ? value : 0);
}

function populateSelect(select, options) {
  select.innerHTML = options
    .map((option) => `<option value="${option.value}">${option.label}</option>`)
    .join("");
}

function buildLoadTable() {
  elements.loadTableBody.innerHTML = loadGroups
    .map(
      (group) => `
        <tr data-id="${group.id}">
          <td>${group.id}</td>
          <td class="font-semibold">${group.name}</td>
          <td><input type="number" min="0" step="1" value="${group.power}" data-role="power" /></td>
          <td><input type="number" min="0" max="2" step="0.01" value="${group.ks}" data-role="ks" /></td>
          <td data-role="ratio" class="text-secondary">0%</td>
          <td data-role="thdi" class="font-bold">0%</td>
        </tr>
      `
    )
    .join("");
}

function thdiFromLoadGroup(groupId, ratioPercent, ks) {
  switch (groupId) {
    case 1:
      // FIX BUG: direct motor contribution formula is 3 * X1%. Since ratioPercent is (0-100), 
      // we must divide by 100 to convert from percentage scaling.
      return (3 * ratioPercent) / 100;
    case 2:
      if (ratioPercent < 15) return (12 * ratioPercent * ks) / 100;
      if (ratioPercent < 25) return (15 * ratioPercent * ks) / 100;
      if (ratioPercent < 40) return (25 * ratioPercent * ks) / 100;
      if (ratioPercent < 60) return (30 * ratioPercent * ks) / 100;
      return (40 * ratioPercent * ks) / 100;
    case 3:
      return (12 * ratioPercent * ks) / 100;
    case 4:
      return (35 * ratioPercent * ks) / 100;
    case 5:
      return (12 * ratioPercent * ks) / 100;
    case 6:
      return (40 * ratioPercent * ks) / 100;
    case 7:
      return (12 * ratioPercent * ks) / 100;
    case 8:
      return (60 * ratioPercent * ks) / 100;
    case 9:
      return (80 * ratioPercent * ks) / 100;
    case 10:
      return (50 * ratioPercent * ks) / 100;
    case 11:
      return (45 * ratioPercent * ks) / 100;
    case 12:
      return (10 * ratioPercent * ks) / 100;
    default:
      return 0;
  }
}

function classifyVolatility(deltaPPercent, variationTime) {
  if (deltaPPercent < 10 && variationTime > 60) {
    return {
      level: "Tải ổn định",
      examples: "Gia nhiệt điện trở, chiếu sáng, data center",
      kpRange: [1.0, 1.2],
      solution: "Đề xuất sử dụng tụ bù"
    };
  }

  if (deltaPPercent <= 30 && variationTime >= 10 && variationTime <= 60) {
    return {
      level: "Tải biến động trung bình",
      examples: "HVAC, chiller, bơm biến tần, quạt biến tần",
      kpRange: [1.15, 1.3],
      solution: "Đề xuất sử dụng tụ bù + cuộn kháng 7%"
    };
  }

  if (deltaPPercent <= 50 && variationTime >= 1 && variationTime < 10) {
    return {
      level: "Tải biến động mạnh",
      examples: "Cẩu trục, máy ép, máy hàn",
      kpRange: [1.2, 1.35],
      solution: "Đề xuất sử dụng tụ bù + cuộn kháng 13% + AHF + SVG"
    };
  }

  return {
    level: "Tải biến động rất mạnh",
    examples: "Lò hồ quang, lò trung tần, spot welding",
    kpRange: [1.3, 1.6],
    solution: "Đề xuất sử dụng tụ bù + cuộn kháng 14% + AHF + SVG"
  };
}

// Map the exact Kp reserve factor ranges from Section E of the document
function getSuggestedKpRange(level, importance, building) {
  const isHighImportance = (importance === "IV" || importance === "V");
  
  if (level === "Tải ổn định") {
    if (building === "data-center" || building === "server-room") {
      return [1.0, 1.2];
    }
    if (isHighImportance) {
      return [1.2, 1.5];
    }
    return [1.0, 1.2];
  }
  
  if (level === "Tải biến động trung bình") {
    if (isHighImportance) {
      return [1.2, 1.5];
    }
    return [1.15, 1.3];
  }
  
  if (level === "Tải biến động mạnh") {
    if (isHighImportance) {
      return [1.2, 1.6];
    }
    return [1.2, 1.35];
  }
  
  // Tải biến động rất mạnh
  if (isHighImportance) {
    return [1.4, 2.0];
  }
  return [1.3, 1.6];
}

function determinePrimarySolution(thdiTotal) {
  if (thdiTotal < 10) {
    return {
      label: "Tụ bù",
      reactor: "Không cần cuộn kháng",
      reason: "THDi dưới 10%, có thể dùng tụ bù thông thường nếu hệ thống ổn định.",
      requireAhf: false,
      requireSvg: false
    };
  }

  if (thdiTotal < 25) {
    return {
      label: "Tụ bù + cuộn kháng 7%",
      reactor: "Cuộn kháng 7%",
      reason: "THDi trong dải 10% đến dưới 25%, nên dùng bộ bù có detuned reactor 7%.",
      requireAhf: false,
      requireSvg: false
    };
  }

  if (thdiTotal < 35) {
    return {
      label: "Tụ bù + cuộn kháng 13%",
      reactor: "Cuộn kháng 13%",
      reason: "THDi trong dải 25% đến dưới 35%, cần tăng mức detuning để bảo vệ tụ bù.",
      requireAhf: false,
      requireSvg: false
    };
  }

  if (thdiTotal < 40) {
    return {
      label: "Tụ bù + cuộn kháng 14% + cân nhắc AHF",
      reactor: "Cuộn kháng 14%",
      reason: "THDi trong dải 35% đến dưới 40%, nên dùng reactor 14% và xem xét AHF.",
      requireAhf: true,
      requireSvg: false
    };
  }

  return {
    label: "Tụ bù + cuộn kháng 14% + AHF + SVG",
    reactor: "Cuộn kháng 14%",
    reason: "THDi trên 40%, cần giải pháp lọc tích cực và bù động, đồng thời khảo sát PQ sau vận hành.",
    requireAhf: true,
    requireSvg: true
  };
}

function getMvaRecommendation(building, transformerPower) {
  const [minBand, maxBand] = building.mvaBand;
  return {
    min: transformerPower * minBand,
    max: transformerPower * maxBand,
    family: building.family
  };
}

function calculateReactiveCompensation(activePower, cos1, cos2) {
  if (!activePower || !cos1 || !cos2 || cos1 >= 1 || cos2 >= 1) {
    return 0;
  }

  const tan1 = Math.tan(Math.acos(Math.min(Math.max(cos1, 0.01), 0.999)));
  const tan2 = Math.tan(Math.acos(Math.min(Math.max(cos2, 0.01), 0.999)));
  return Math.max(activePower * (tan1 - tan2), 0);
}

function getValue(id) {
  return Number(elements[id].value || 0);
}

function renderNotes(target, notes) {
  target.innerHTML = notes.map((note) => `<div class="note">${note}</div>`).join("");
}

function renderList(target, items, emptyText) {
  target.innerHTML = items.length
    ? items.map((item) => `<li>${item}</li>`).join("")
    : `<li>${emptyText}</li>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function uint8ArrayToBase64(uint8) {
  const CHUNK_SIZE = 0x8000;
  let index = 0;
  let result = "";
  while (index < uint8.length) {
    const slice = uint8.subarray(index, Math.min(index + CHUNK_SIZE, uint8.length));
    result += String.fromCharCode.apply(null, slice);
    index += CHUNK_SIZE;
  }
  return window.btoa(result);
}

function getImageDataUrl(image) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  return canvas.toDataURL("image/png");
}

async function loadAssetDataUrl(path) {
  if (assetDataUrlCache.has(path)) {
    return assetDataUrlCache.get(path);
  }

  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Không thể tải asset ${path}`);
  }

  const blob = await response.blob();
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Không thể đọc asset ${path}`));
    reader.readAsDataURL(blob);
  });

  assetDataUrlCache.set(path, dataUrl);
  return dataUrl;
}

function convertVietnameseAccents(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

async function loadFonts() {
  if (regularFontBase64 && boldFontBase64) return true;

  const originalHtml = elements.exportPdfButton?.innerHTML || "";
  if (elements.exportPdfButton) {
    elements.exportPdfButton.disabled = true;
    elements.exportPdfButton.textContent = "Đang tải font...";
  }

  try {
    const [regRes, boldRes] = await Promise.all([
      fetch("./fonts/Montserrat-Regular.ttf"),
      fetch("./fonts/Montserrat-Bold.ttf")
    ]);
    if (!regRes.ok || !boldRes.ok) {
      throw new Error("Không thể tải font local.");
    }

    const [regBuffer, boldBuffer] = await Promise.all([
      regRes.arrayBuffer(),
      boldRes.arrayBuffer()
    ]);

    regularFontBase64 = uint8ArrayToBase64(new Uint8Array(regBuffer));
    boldFontBase64 = uint8ArrayToBase64(new Uint8Array(boldBuffer));
    return true;
  } catch (error) {
    console.error("Font loading error:", error);
    return false;
  } finally {
    if (elements.exportPdfButton) {
      elements.exportPdfButton.innerHTML = originalHtml;
      elements.exportPdfButton.disabled = !latestReport;
    }
  }
}

function drawKeyValueRow(doc, yPos, items) {
  const margin = 20;
  const totalWidth = 170;
  const colW = totalWidth / items.length;
  const hasMontserrat = doc.getFont().fontName === "Montserrat";

  doc.setFont(doc.getFont().fontName, "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  items.forEach((item, index) => {
    doc.text(hasMontserrat ? item.label : convertVietnameseAccents(item.label), margin + index * colW, yPos);
  });

  yPos += 3.5;
  doc.setFont(doc.getFont().fontName, "bold");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);
  items.forEach((item, index) => {
    doc.text(hasMontserrat ? item.value : convertVietnameseAccents(item.value), margin + index * colW, yPos);
  });

  yPos += 2.5;
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.15);
  doc.line(margin, yPos, margin + totalWidth, yPos);
  return yPos + 4.5;
}

function drawCard(doc, x, y, w, h, title, val, details, accentColor) {
  const hasMontserrat = doc.getFont().fontName === "Montserrat";
  doc.setFillColor(250, 250, 250);
  doc.rect(x, y, w, h, "F");
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.25);
  doc.rect(x, y, w, h, "S");
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(x, y, w, 1.5, "F");
  doc.setFont(doc.getFont().fontName, "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(hasMontserrat ? title : convertVietnameseAccents(title), x + 4, y + 6);
  doc.setFont(doc.getFont().fontName, "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(hasMontserrat ? val : convertVietnameseAccents(val), x + 4, y + 12.5);
  doc.setFont(doc.getFont().fontName, "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(hasMontserrat ? details : convertVietnameseAccents(details), x + 4, y + 18);
}

function drawFooter(doc, pageNum, totalPages, hasMontserrat) {
  const y = 285;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.25);
  doc.line(20, y - 4, 190, y - 4);
  doc.setFont(doc.getFont().fontName, "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  const footerText = hasMontserrat
    ? "MASTER Engineering Suite • Báo cáo tính toán tụ bù, cuộn kháng và AHF"
    : "MASTER Engineering Suite - Bao cao tinh toan tu bu, cuon khang va AHF";
  doc.text(footerText, 20, y);
  doc.text(`Trang ${pageNum} / ${totalPages}`, 190, y, { align: "right" });
}

function collectCurrentReport(data) {
  const parallelTransformers = getValue("parallelTransformers");
  const usageFactor = getValue("usageFactor");
  const coincidenceFactor = getValue("coincidenceFactor");
  const thduTarget = getValue("thduTarget");
  const ukPercent = getValue("ukPercent");
  const declaredPct = data.activePower > 0 ? (data.totalDeclaredLoad / data.activePower) * 100 : 0;
  const nonlinearPct = data.thdiFromLoads;
  const ilA = data.voltage > 0 && data.cos1 > 0
    ? (usageFactor * data.activePower * 1000) / (1.73 * data.voltage * data.cos1)
    : 0;
  const iscKa = data.voltage > 0 && ukPercent > 0
    ? ((data.transformerPower * parallelTransformers) / (1.73 * data.voltage * (ukPercent / 100))) / 1000
    : 0;
  const thduEstimate = Math.max(thduTarget, data.thdiTotal * 0.22);
  const reactorPct = data.primarySolution.reactor === "Không cần cuộn kháng"
    ? "0%"
    : data.primarySolution.reactor.replace("Cuộn kháng ", "");
  const capVoltage = data.primarySolution.reactor === "Cuộn kháng 7%"
    ? 480
    : (data.primarySolution.reactor.includes("13%") || data.primarySolution.reactor.includes("14%") ? 525 : 440);
  const capVoltageRaw = Math.round(data.voltage * Math.sqrt(1 + (reactorPct === "0%" ? 0 : parseFloat(reactorPct) / 100)));
  const ahfKva = (data.ahfCurrent * 1.73 * data.voltage) / 1000;
  const dominantLoad = [...data.loadRows].sort((a, b) => b.power - a.power)[0]?.name || "";
  const harmonics = [];
  if (data.loadRows.some((r) => /12 xung/i.test(r.name) && r.power > 0)) harmonics.push(11, 13, 23, 25);
  if (data.loadRows.some((r) => /6 xung|VFD|UPS|Rectifier|Chỉnh lưu/i.test(r.name) && r.power > 0)) harmonics.push(5, 7, 11, 13);
  if (data.singlePhaseRatio > 40) harmonics.push(3, 9, 15);
  const uniqueHarmonics = [...new Set(harmonics)].sort((a, b) => a - b);
  const warningObjects = data.warnings.map((warning) => {
    let level = "info";
    if (/vượt|không|lỗi|khóa|cộng hưởng/i.test(warning)) level = "danger";
    else if (/cần|nên|kiểm tra|lưu ý/i.test(warning)) level = "warning";
    return {
      level,
      title: level === "danger" ? "Cảnh báo quan trọng" : (level === "warning" ? "Lưu ý kỹ thuật" : "Khuyến nghị"),
      body: warning
    };
  });

  latestReport = {
    generatedAt: new Date(),
    projectName: elements.projectName.value.trim() || "Chưa đặt tên dự án",
    rules: { label: data.building.label },
    importance: { label: data.importance.label, code: data.importance.value },
    buildingLabel: data.building.label,
    importanceLabel: data.importance.label,
    importanceCode: data.importance.value,
    thdiInitial: data.building.thdiInitial,
    activePower: data.activePower,
    transformerPower: data.transformerPower,
    frequency: getValue("frequency"),
    voltage: data.voltage,
    wiringDiagram: elements.wiringDiagram.value,
    ukPercent,
    parallelTransformers,
    usageFactor,
    coincidenceFactor,
    cos1: data.cos1,
    cos2: data.cos2,
    compensationMethod: elements.compensationMethod.options[elements.compensationMethod.selectedIndex].text,
    operationHours: data.operationHours,
    hasGenerator: data.hasGenerator,
    generatorPower: getValue("generatorPower"),
    hasSolar: data.hasSolar,
    solarPower: getValue("solarPower"),
    totalDeclaredLoad: data.totalDeclaredLoad,
    thdiFromLoads: data.thdiFromLoads,
    thdiTotal: data.thdiTotal,
    thdiTarget: data.thdiTarget,
    mbaRecommendation: data.mbaRecommendation,
    reactiveCompensation: data.reactiveCompensation,
    compensatedReference: data.compensatedReference,
    primarySolution: data.primarySolution,
    singlePhaseRatio: data.singlePhaseRatio,
    deltaPPercent: data.deltaPPercent,
    variationTime: data.variationTime,
    volatility: data.volatility,
    kpRange: data.kpRange,
    reserveFactor: data.reserveFactor,
    ahfCurrent: data.ahfCurrent,
    svgKvar: data.svgKvar,
    loadsValid: data.loadsValid,
    designAlerts: data.designAlerts,
    recommendations: data.recommendations,
    warnings: data.warnings,
    loadRows: data.loadRows,
    input: {
      projectType: data.building.value,
      transformerKva: data.transformerPower,
      parallelTransformers,
      loadPowerKw: data.activePower,
      ku: usageFactor,
      ks: coincidenceFactor,
      ratedVoltage: data.voltage,
      frequency: getValue("frequency"),
      wiring: elements.wiringDiagram.value,
      cosPhiBefore: data.cos1,
      cosPhiTarget: data.cos2,
      ukPercent,
      rectifierPulse: data.loadRows.some((r) => /12 xung/i.test(r.name) && r.power > 0) ? 12 : (data.loadRows.some((r) => /6 xung|VFD|UPS|Rectifier|Chỉnh lưu/i.test(r.name) && r.power > 0) ? 6 : 0),
      rapidFluctuation: !/ổn định/i.test(data.volatility.level),
      operatingHours: data.operationHours,
      singlePhasePct: data.singlePhaseRatio,
      motorDirectPct: data.activePower > 0 ? ((data.loadRows.find((r) => r.id === 1)?.power || 0) / data.activePower) * 100 : 0,
      vfdPct: data.activePower > 0 ? ((((data.loadRows.find((r) => r.id === 2)?.power || 0) + (data.loadRows.find((r) => r.id === 3)?.power || 0)) / data.activePower) * 100) : 0,
      upsPct: data.activePower > 0 ? ((((data.loadRows.find((r) => r.id === 4)?.power || 0) + (data.loadRows.find((r) => r.id === 5)?.power || 0)) / data.activePower) * 100) : 0,
      ledPct: data.activePower > 0 ? ((data.loadRows.find((r) => r.id === 10)?.power || 0) / data.activePower) * 100 : 0,
      hvacPct: data.activePower > 0 ? ((data.loadRows.find((r) => r.id === 11)?.power || 0) / data.activePower) * 100 : 0,
      rectifierPct: data.activePower > 0 ? ((((data.loadRows.find((r) => r.id === 6)?.power || 0) + (data.loadRows.find((r) => r.id === 7)?.power || 0)) / data.activePower) * 100) : 0,
      weldingPct: data.activePower > 0 ? ((data.loadRows.find((r) => r.id === 9)?.power || 0) / data.activePower) * 100 : 0,
      furnacePct: data.activePower > 0 ? ((data.loadRows.find((r) => r.id === 8)?.power || 0) / data.activePower) * 100 : 0
    },
    ilA,
    iscKa,
    targetThdu: thduTarget,
    targetThdi: data.thdiTarget,
    declaredPct,
    nonlinearPct,
    thdi: data.thdiTotal,
    thdu: thduEstimate,
    totalKvar: data.compensatedReference,
    baseCompKvar: (data.mbaRecommendation.min + data.mbaRecommendation.max) / 2,
    cosCompKvar: data.reactiveCompensation,
    reactorPct,
    capVoltage,
    capVoltageRaw,
    capModel: `${formatNumber(data.compensatedReference, 0)} kVAr | ${data.primarySolution.reactor}`,
    solution: data.primarySolution.label,
    ahfNeeded: data.ahfCurrent > 0 || data.primarySolution.requireAhf,
    ahf: {
      recommendedA: data.ahfCurrent,
      recommendedKva: ahfKva,
      targetThdi: data.thdiTarget
    },
    harmonics: uniqueHarmonics,
    warningObjects,
    dominantLoad
  };
}

async function exportWord() {
  if (!latestReport) {
    showExportIssues("word");
    return;
  }

  try {
    let logoHtml = `
      <div style="display:inline-block;padding:7px 10px;border:1px solid #d7e3ea;border-radius:10px;color:#0f6c5c;font-weight:700;font-size:11pt;letter-spacing:0.04em;">
        MASTER
      </div>
    `;
    try {
      const reportIconDataUrl = await loadAssetDataUrl("./icons/icon.png");
      logoHtml = `
        <img
          src="${reportIconDataUrl}"
          width="36"
          height="36"
          alt="MASTER"
          style="width:36px;height:36px;display:block;margin-left:auto;object-fit:contain;border:0;outline:none;text-decoration:none;"
        >
      `;
    } catch (assetError) {
      console.warn("Could not load report icon for Word export:", assetError);
    }

    const activeLoads = [
      { name: "Động cơ chạy trực tiếp", pct: latestReport.input.motorDirectPct },
      { name: "Biến tần VFD", pct: latestReport.input.vfdPct },
      { name: "UPS", pct: latestReport.input.upsPct },
      { name: "LED / SMPS / Server", pct: latestReport.input.ledPct },
      { name: "Chiller / AHU / Bơm / Quạt", pct: latestReport.input.hvacPct },
      { name: "Chỉnh lưu AC/DC", pct: latestReport.input.rectifierPct },
      { name: "Máy hàn", pct: latestReport.input.weldingPct },
      { name: "Lò nhiệt / lò cảm ứng", pct: latestReport.input.furnacePct },
      { name: "Tải 1 pha trên tổng tải", pct: latestReport.input.singlePhasePct }
    ].filter((item) => item.pct > 0);

    const loadRowsHtml = activeLoads
      .map((item) => `
        <tr>
          <td style="padding:6px;border:1px solid #cbd5e1;">${item.name}</td>
          <td style="padding:6px;border:1px solid #cbd5e1;text-align:right;">${formatNumber(item.pct, 1, "%")}</td>
        </tr>
      `)
      .join("");

    const warningsHtml = latestReport.warningObjects
      .map((warning) => {
        let colorHex = "#13795b";
        let bgHex = "#ecfbf5";
        let textHex = "#064e3b";
        if (warning.level === "danger") {
          colorHex = "#c2410c";
          bgHex = "#fff1ec";
          textHex = "#7c2d12";
        } else if (warning.level === "warning") {
          colorHex = "#b7791f";
          bgHex = "#fff9e8";
          textHex = "#713f12";
        }
        return `
          <div style="border-left:4px solid ${colorHex}; background-color:${bgHex}; padding:10px; margin-bottom:12px; border-radius:4px;">
            <h4 style="margin:0 0 4px 0; color:${textHex}; font-size:11pt;">${warning.title}</h4>
            <p style="margin:0; color:#475569; font-size:10pt;">${warning.body}</p>
          </div>
        `;
      })
      .join("");

    const recommendationHtml = latestReport.recommendations
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");

    const narrativeText = [
      `Dự án ${latestReport.projectName} thuộc ${latestReport.importance.label}, với mục tiêu THDu ${formatNumber(latestReport.targetThdu, 0, "%")} và THDi ${formatNumber(latestReport.targetThdi, 0, "%")}.`,
      `Cơ cấu tải hiện tại cho thấy THDi(c) ước tính ${formatNumber(latestReport.nonlinearPct, 1, "%")}; dung lượng bù tham chiếu khoảng ${formatNumber(latestReport.totalKvar, 1, "kVAr")}.`,
      `Dòng tải tính toán khoảng ${formatNumber(latestReport.ilA, 1, "A")}, dòng ngắn mạch Isc khoảng ${formatNumber(latestReport.iscKa, 1, "kA")}, THDu tham chiếu khoảng ${formatNumber(latestReport.thdu, 1, "%")}.`,
      `Giải pháp hiện nghiêng về ${latestReport.solution}; cấu hình ưu tiên ${latestReport.capModel}.`,
      latestReport.ahfNeeded
        ? `Khuyến nghị sơ bộ AHF ${formatNumber(latestReport.ahf.recommendedA, 1, "A")} tương ứng khoảng ${formatNumber(latestReport.ahf.recommendedKva, 1, "kVA")}.`
        : "Hiện chưa bắt buộc AHF, tuy nhiên vẫn nên đo kiểm chất lượng điện năng sau khi công trình đi vào vận hành."
    ];

    const narrativeHtml = narrativeText
      .map((paragraph) => `<p class="narrative-p">${escapeHtml(paragraph)}</p>`)
      .join("");

    const harmonicsText = latestReport.harmonics.length
      ? latestReport.harmonics.map((h) => `H${h}`).join(", ")
      : "Không ghi nhận rõ bậc hài ưu thế từ dữ liệu hiện tại";

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Báo cáo MASTER</title>
        <style>
          @page Section1 {
            size: 595.3pt 841.9pt;
            margin: 56.7pt 42.5pt 56.7pt 42.5pt;
            mso-header-margin: 21.25pt;
            mso-footer-margin: 21.25pt;
          }
          div.Section1 { page: Section1; }
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; font-size: 11pt; }
          .header-table { width: 100%; border: none; margin-bottom: 18px; }
          .header-brand { color: #0f6c5c; font-weight: bold; font-size: 11pt; text-align: left; }
          .header-logo { text-align: right; width: 56px; }
          h1 { color: #0f6c5c; font-size: 16pt; font-weight: bold; margin-top: 14px; margin-bottom: 5px; }
          .subtitle { color: #475569; font-size: 11pt; margin-bottom: 15px; }
          .meta-table { width: 100%; border: 1px solid #e2e8f0; background-color: #f8fafc; margin-bottom: 25px; }
          .meta-table td { padding: 6px 12px; border: none; font-size: 9.5pt; color: #475569; }
          h2 { color: #0f6c5c; font-size: 12pt; font-weight: bold; border-bottom: 1.5px solid #0f6c5c; padding-bottom: 4px; margin-top: 25px; margin-bottom: 10px; }
          .data-table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          .data-table th, .data-table td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; font-size: 10pt; }
          .data-table th { background-color: #f1f5f9; color: #334155; font-weight: bold; }
          .highlight-row { background-color: #f8fafc; }
          .card-grid { width: 100%; border-collapse: separate; border-spacing: 10px; margin-bottom: 20px; }
          .card-cell { width: 50%; vertical-align: top; border: 1px solid #dbe5ec; background: #fafcfd; padding: 10px 12px; border-top: 3px solid #0f6c5c; border-radius: 4px; }
          .card-cell h3 { margin: 0 0 6px 0; color: #64748b; font-size: 9pt; font-weight: normal; }
          .card-value { margin: 0 0 4px 0; color: #0f172a; font-size: 12pt; font-weight: bold; }
          .card-desc { margin: 0; color: #475569; font-size: 8.5pt; }
          .solution-box { border: 1.5px solid #0f6c5c; background-color: #f8fafc; padding: 12px; margin-bottom: 22px; border-radius: 4px; }
          .solution-box h3 { margin: 0 0 4px 0; color: #0f6c5c; font-size: 10pt; font-weight: bold; }
          .solution-box p { margin: 0; color: #1e293b; font-size: 10.5pt; }
          .narrative-p { font-size: 10.5pt; text-align: justify; margin: 0 0 10px 0; color: #334155; }
          .rec-list { margin: 8px 0 0 18px; padding: 0; }
          .rec-list li { margin-bottom: 6px; }
          .footer-line { border-top: 1px solid #cbd5e1; margin-top: 34px; padding-top: 8px; font-size: 8.5pt; color: #94a3b8; }
          .signature-table { width: 100%; border: none; margin-top: 38px; }
          .signature-table td { border: none; padding: 6px; width: 50%; vertical-align: top; text-align: center; }
          .signature-title { font-weight: bold; color: #475569; font-size: 10pt; }
          .signature-desc { color: #94a3b8; font-size: 8.5pt; margin-bottom: 52px; }
          .signature-name { font-weight: bold; color: #0f6c5c; font-size: 10pt; }
        </style>
      </head>
      <body>
        <div style='mso-element:header' id='masterHeader'>
          <table style='width:100%; border:none; border-bottom:1px solid #d9e2e8; font-size:8.5pt; color:#64748b;'>
            <tr>
              <td style='border:none;'>MASTER Engineering Suite</td>
              <td style='border:none; text-align:right;'>${escapeHtml(latestReport.projectName)}</td>
            </tr>
          </table>
        </div>
        <div style='mso-element:footer' id='masterFooter'>
          <table style='width:100%; border:none; border-top:1px solid #d9e2e8; font-size:8pt; color:#94a3b8;'>
            <tr>
              <td style='border:none;'>MASTER Engineering Suite • Báo cáo tính toán tụ bù, cuộn kháng và AHF</td>
              <td style='border:none; text-align:right;'>Trang <span style='mso-field-code:" PAGE "'></span>/<span style='mso-field-code:" NUMPAGES "'></span></td>
            </tr>
          </table>
        </div>
        <div class="Section1">
          <table class="header-table">
            <tr>
              <td class="header-brand">MASTER ENGINEERING SUITE</td>
              <td class="header-logo">${logoHtml}</td>
            </tr>
          </table>
          <h1>BÁO CÁO TÍNH TOÁN TỤ BÙ, CUỘN KHÁNG VÀ AHF</h1>
          <div class="subtitle">Dự án: ${escapeHtml(latestReport.projectName)} - ${escapeHtml(latestReport.rules.label)}</div>

          <table class="meta-table">
            <tr>
              <td><strong>MÃ BÁO CÁO:</strong> MR-${Date.now().toString().slice(-6)}</td>
              <td><strong>NGÀY LẬP:</strong> ${new Date().toLocaleDateString("vi-VN")} ${new Date().toLocaleTimeString("vi-VN")}</td>
              <td><strong>VẬN HÀNH:</strong> Liên tục</td>
            </tr>
          </table>

          <h2>I. THÔNG SỐ VẬN HÀNH ĐẦU VÀO</h2>
          <table class="data-table">
            <tr class="highlight-row">
              <td><strong>Công suất 1 MBA:</strong> ${formatNumber(latestReport.input.transformerKva, 0, "kVA")}</td>
              <td><strong>Số MBA song song:</strong> ${formatNumber(latestReport.input.parallelTransformers, 0)}</td>
              <td><strong>Công suất tải tổng:</strong> ${formatNumber(latestReport.input.loadPowerKw, 0, "kW")}</td>
            </tr>
            <tr>
              <td><strong>Hệ số sử dụng Ku:</strong> ${formatNumber(latestReport.input.ku, 2)}</td>
              <td><strong>Dòng phụ tải (IL):</strong> ${formatNumber(latestReport.ilA, 1, "A")}</td>
              <td><strong>Ngắn mạch (Isc):</strong> ${formatNumber(latestReport.iscKa, 1, "kA")}</td>
            </tr>
            <tr class="highlight-row">
              <td><strong>Điện áp định mức:</strong> ${formatNumber(latestReport.input.ratedVoltage, 0, "V")}</td>
              <td><strong>Tần số hệ thống:</strong> ${formatNumber(latestReport.input.frequency, 0, "Hz")}</td>
              <td><strong>Sơ đồ đấu nối:</strong> ${escapeHtml(latestReport.input.wiring)}</td>
            </tr>
            <tr>
              <td><strong>Cosφ trước bù:</strong> ${formatNumber(latestReport.input.cosPhiBefore, 2)}</td>
              <td><strong>Cosφ mục tiêu:</strong> ${formatNumber(latestReport.input.cosPhiTarget, 2)}</td>
              <td><strong>Uk% MBA:</strong> ${formatNumber(latestReport.input.ukPercent, 1, "%")}</td>
            </tr>
          </table>

          <h2>II. CƠ CẤU TẢI CHI TIẾT & CHỈ SỐ PHI TUYẾN</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Tên nhóm phụ tải</th>
                <th>Tỷ lệ khai báo</th>
              </tr>
            </thead>
            <tbody>${loadRowsHtml}</tbody>
          </table>

          <h2>III. KẾT QUẢ ĐÁNH GIÁ & ĐỀ XUẤT THIẾT BỊ</h2>
          <table class="card-grid">
            <tr>
              <td class="card-cell">
                <h3>Méo dạng sóng hài (THDi / THDu)</h3>
                <div class="card-value">${formatNumber(latestReport.thdi, 1, "%")} / ${formatNumber(latestReport.thdu, 1, "%")}</div>
                <p class="card-desc">${escapeHtml(latestReport.dominantLoad || "Đánh giá từ cơ cấu tải hiện tại")}</p>
              </td>
              <td class="card-cell">
                <h3>Bù công suất phản kháng tổng</h3>
                <div class="card-value">${formatNumber(latestReport.totalKvar, 1, "kVAr")}</div>
                <p class="card-desc">Bù theo MBA: ${formatNumber(latestReport.baseCompKvar, 1, "kVAr")} | Bù theo cosφ: ${formatNumber(latestReport.cosCompKvar, 1, "kVAr")}</p>
              </td>
            </tr>
            <tr>
              <td class="card-cell">
                <h3>Cuộn kháng & điện áp tụ</h3>
                <div class="card-value">${escapeHtml(latestReport.reactorPct)} | ${escapeHtml(String(latestReport.capVoltage))} VAC</div>
                <p class="card-desc">Điện áp tính toán trên tụ: ${formatNumber(latestReport.capVoltageRaw, 0, "V")}</p>
              </td>
              <td class="card-cell">
                <h3>Bộ lọc sóng hài tích cực AHF</h3>
                <div class="card-value">${latestReport.ahfNeeded ? formatNumber(latestReport.ahf.recommendedA, 1, "A") : "Chưa bắt buộc"}</div>
                <p class="card-desc">${latestReport.ahfNeeded ? `Dung lượng: ${formatNumber(latestReport.ahf.recommendedKva, 1, "kVA")} | Mục tiêu: <${latestReport.ahf.targetThdi}%` : "Mức độ méo hài đang nằm trong ngưỡng tham chiếu"}</p>
              </td>
            </tr>
          </table>

          <div class="solution-box">
            <h3>GIẢI PHÁP TỔNG THỂ KHUYẾN NGHỊ</h3>
            <p>${escapeHtml(latestReport.solution)} | ${escapeHtml(latestReport.capModel)}</p>
          </div>

          <h2>IV. ĐÁNH GIÁ CHI TIẾT HỆ THỐNG</h2>
          ${narrativeHtml}

          <h2>V. KHUYẾN NGHỊ VẬN HÀNH</h2>
          <ul class="rec-list">${recommendationHtml}</ul>

          <h2>VI. CẢNH BÁO KỸ THUẬT & KHUYẾN NGHỊ</h2>
          ${warningsHtml}

          <h2>VII. THÀNH PHẦN SÓNG HÀI ĐẶC TRƯNG</h2>
          <p class="narrative-p">Bậc hài ưu thế dự đoán từ cơ cấu tải hiện tại: <strong>${escapeHtml(harmonicsText)}</strong>.</p>

          <table class="signature-table">
            <tr>
              <td>
                <div class="signature-title">KỸ SƯ THỰC HIỆN</div>
                <div class="signature-desc">(Ký & ghi rõ họ tên)</div>
                <div class="signature-name">MASTER Advisor System</div>
              </td>
              <td>
                <div class="signature-title">PHÊ DUYỆT BÁO CÁO</div>
                <div class="signature-desc">(Ký, đóng dấu & ghi rõ họ tên)</div>
                <div class="signature-name">Ban Kỹ thuật & Công nghệ</div>
              </td>
            </tr>
          </table>

          <div class="footer-line">
            MASTER Engineering Suite • Báo cáo phát hành tự động • Tài liệu nội bộ.
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + htmlContent], {
      type: "application/msword;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MASTER-report-${Date.now()}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Word export failed:", error);
    alert("Xuất báo cáo Word thất bại. Mở Console để xem chi tiết lỗi.");
  }
}

async function exportPdf() {
  if (!latestReport) {
    showExportIssues("pdf");
    return;
  }
  if (!window.jspdf) {
    alert("Thư viện xuất PDF chưa tải được. Vui lòng tải lại trang.");
    return;
  }

  try {
    const fontsLoaded = await loadFonts();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    if (fontsLoaded && regularFontBase64 && boldFontBase64) {
      try {
        doc.addFileToVFS("Montserrat-Regular.ttf", regularFontBase64);
        doc.addFont("Montserrat-Regular.ttf", "Montserrat", "normal");
        doc.addFileToVFS("Montserrat-Bold.ttf", boldFontBase64);
        doc.addFont("Montserrat-Bold.ttf", "Montserrat", "bold");
        doc.setFont("Montserrat", "normal");
      } catch (e) {
        console.error("Error registering custom fonts in jsPDF:", e);
        doc.setFont("helvetica", "normal");
      }
    } else {
      doc.setFont("helvetica", "normal");
    }

    let yPos = 10;
    doc.setFillColor(15, 108, 92);
    doc.rect(20, yPos, 170, 3, "F");
    let headerY = yPos + 10;
    doc.setFont(doc.getFont().fontName, "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 108, 92);
    doc.text("MASTER ENGINEERING SUITE", 20, headerY);

    const logoImage = document.querySelector(".brand-logo");
    if (logoImage && logoImage.complete) {
      try {
        const logoDataUrl = getImageDataUrl(logoImage);
        doc.addImage(logoDataUrl, "PNG", 154, headerY - 5, 36, 12, undefined, "FAST");
      } catch (e) {
        console.warn("Could not render logo in PDF:", e);
      }
    }

    headerY += 12;
    doc.setFont(doc.getFont().fontName, "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    const hasMontserrat = doc.getFont().fontName === "Montserrat";
    const docTitle = hasMontserrat
      ? "BÁO CÁO TÍNH TOÁN TỤ BÙ, CUỘN KHÁNG VÀ AHF"
      : "BAO CAO TINH TOAN TU BU, CUON KHANG VA AHF";
    doc.text(docTitle, 20, headerY);

    headerY += 6;
    doc.setFont(doc.getFont().fontName, "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const projectLine = `${latestReport.projectName} - ${latestReport.rules.label}`;
    doc.text(hasMontserrat ? projectLine : convertVietnameseAccents(projectLine), 20, headerY);

    headerY += 4;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.25);
    doc.line(20, headerY, 190, headerY);
    headerY += 6;
    yPos = headerY;

    doc.setFillColor(248, 250, 252);
    doc.rect(20, yPos, 170, 10, "F");
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.15);
    doc.rect(20, yPos, 170, 10, "S");
    doc.setFont(doc.getFont().fontName, "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const reportCode = "MR-" + Date.now().toString().slice(-6);
    const formattedDate = new Date().toLocaleDateString("vi-VN") + " " + new Date().toLocaleTimeString("vi-VN");
    doc.text(hasMontserrat ? `MÃ BÁO CÁO: ${reportCode}` : `Mã Báo Cáo: ${reportCode}`, 24, yPos + 6.5);
    doc.text(hasMontserrat ? `NGÀY LẬP: ${formattedDate}` : `Ngày Lập: ${formattedDate}`, 70, yPos + 6.5);
    doc.text(hasMontserrat ? "VẬN HÀNH: Liên tục" : "Vận Hành: Liên tục", 152, yPos + 6.5);
    yPos += 16;

    doc.setFont(doc.getFont().fontName, "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 108, 92);
    doc.text(hasMontserrat ? "I. THÔNG SỐ VẬN HÀNH ĐẦU VÀO" : "I. Thông Số Vận Hành Đầu Vào", 20, yPos);
    yPos += 5.5;

    yPos = drawKeyValueRow(doc, yPos, [
      { label: "Công suất 1 MBA", value: formatNumber(latestReport.input.transformerKva, 0, "kVA") },
      { label: "Số MBA song song", value: formatNumber(latestReport.input.parallelTransformers, 0) },
      { label: "Công suất tải tổng", value: formatNumber(latestReport.input.loadPowerKw, 0, "kW") }
    ]);
    yPos = drawKeyValueRow(doc, yPos, [
      { label: "Hệ số sử dụng Ku", value: formatNumber(latestReport.input.ku, 2) },
      { label: "Dòng phụ tải (IL)", value: formatNumber(latestReport.ilA, 1, "A") },
      { label: "Ngắn mạch (Isc)", value: formatNumber(latestReport.iscKa, 1, "kA") }
    ]);
    yPos = drawKeyValueRow(doc, yPos, [
      { label: "Điện áp định mức", value: formatNumber(latestReport.input.ratedVoltage, 0, "V") },
      { label: "Tần số hệ thống", value: formatNumber(latestReport.input.frequency, 0, "Hz") },
      { label: "Sơ đồ đấu nối", value: latestReport.input.wiring }
    ]);
    yPos = drawKeyValueRow(doc, yPos, [
      { label: "Cosφ trước bù", value: formatNumber(latestReport.input.cosPhiBefore, 2) },
      { label: "Cosφ mục tiêu", value: formatNumber(latestReport.input.cosPhiTarget, 2) },
      { label: "Hệ số Uk% MBA", value: formatNumber(latestReport.input.ukPercent, 1, "%") }
    ]);

    doc.setFont(doc.getFont().fontName, "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 108, 92);
    doc.text(hasMontserrat ? "II. KẾT QUẢ ĐÁNH GIÁ & ĐỀ XUẤT THIẾT BỊ" : "II. Kết Quả Đánh Giá & Đề Xuất Thiết Bị", 20, yPos + 2);
    yPos += 7;

    const accentHarmonics = latestReport.thdi > 40 ? [194, 65, 12] : (latestReport.thdi > 25 ? [183, 121, 31] : [19, 121, 91]);
    drawCard(doc, 20, yPos, 82, 22, "Méo dạng sóng hài (THDi / THDu)", `THDi: ${formatNumber(latestReport.thdi, 1, "%")} / THDu: ${formatNumber(latestReport.thdu, 1, "%")}`, latestReport.dominantLoad || "Đánh giá từ cơ cấu tải", accentHarmonics);
    drawCard(doc, 108, yPos, 82, 22, "Bù công suất phản kháng tổng", formatNumber(latestReport.totalKvar, 1, "kVAr"), `MBA: ${formatNumber(latestReport.baseCompKvar, 1, "kVAr")} | Cosφ: ${formatNumber(latestReport.cosCompKvar, 1, "kVAr")}`, [15, 108, 92]);
    yPos += 26;
    drawCard(doc, 20, yPos, 82, 22, "Cuộn kháng & cấp điện áp tụ", `Kháng: ${latestReport.reactorPct} | Tụ: ${latestReport.capVoltage} VAC`, `Điện áp tính toán: ${latestReport.capVoltageRaw} V`, [15, 108, 92]);
    drawCard(doc, 108, yPos, 82, 22, "Bộ lọc sóng hài tích cực AHF", latestReport.ahfNeeded ? `Khuyến nghị: ${formatNumber(latestReport.ahf.recommendedA, 1, "A")}` : "Chưa bắt buộc lắp AHF", latestReport.ahfNeeded ? `Dung lượng: ${formatNumber(latestReport.ahf.recommendedKva, 1, "kVA")} | Mục tiêu: <${latestReport.ahf.targetThdi}%` : "Mức độ méo hài nằm trong ngưỡng", latestReport.ahfNeeded ? [194, 65, 12] : [19, 121, 91]);

    doc.addPage();
    doc.setFillColor(15, 108, 92);
    doc.rect(20, 10, 170, 1.5, "F");
    let yPage2 = 20;

    doc.setFillColor(248, 250, 252);
    doc.rect(20, yPage2, 170, 14, "F");
    doc.setDrawColor(15, 108, 92);
    doc.setLineWidth(0.3);
    doc.rect(20, yPage2, 170, 14, "S");
    doc.setFont(doc.getFont().fontName, "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 108, 92);
    doc.text(hasMontserrat ? "GIẢI PHÁP TỔNG THỂ KHUYẾN NGHỊ" : "Giải Pháp Tổng Thể Khuyến Nghị", 24, yPage2 + 5.5);
    doc.setFont(doc.getFont().fontName, "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    const solText = latestReport.solution + " | " + latestReport.capModel;
    doc.text(hasMontserrat ? solText : convertVietnameseAccents(solText), 24, yPage2 + 10);
    yPage2 += 22;

    doc.setFont(doc.getFont().fontName, "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 108, 92);
    doc.text(hasMontserrat ? "III. ĐÁNH GIÁ CHI TIẾT HỆ THỐNG" : "III. Đánh Giá Chi Tiết Hệ Thống", 20, yPage2);
    yPage2 += 6;
    doc.setFont(doc.getFont().fontName, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    const narrativeText = [
      `Dự án ${latestReport.projectName} thuộc ${latestReport.importance.label}, mục tiêu THDu ${formatNumber(latestReport.targetThdu, 0, "%")} và THDi ${formatNumber(latestReport.targetThdi, 0, "%")}.`,
      `THDi(c) dự đoán ở mức ${formatNumber(latestReport.nonlinearPct, 1, "%")} với dung lượng bù tham chiếu ${formatNumber(latestReport.totalKvar, 1, "kVAr")}.`,
      `Dòng tải ước tính ${formatNumber(latestReport.ilA, 1, "A")}, Isc ước tính ${formatNumber(latestReport.iscKa, 1, "kA")}, THDu ước tính ${formatNumber(latestReport.thdu, 1, "%")}.`,
      `Giải pháp hiện nghiêng về ${latestReport.solution}; ưu tiên cấu hình ${latestReport.capModel}.`,
      latestReport.ahfNeeded ? `Nên cân nhắc AHF sơ bộ ${formatNumber(latestReport.ahf.recommendedA, 1, "A")} tương ứng ${formatNumber(latestReport.ahf.recommendedKva, 1, "kVA")}.` : "Hiện chưa bắt buộc AHF, nhưng vẫn nên đo chất lượng điện năng khi công trình vận hành."
    ];
    narrativeText.forEach((para) => {
      const wrapped = doc.splitTextToSize(hasMontserrat ? para : convertVietnameseAccents(para), 170);
      doc.text(wrapped, 20, yPage2);
      yPage2 += wrapped.length * 4.8 + 2.5;
    });

    yPage2 += 3;
    doc.setFont(doc.getFont().fontName, "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 108, 92);
    doc.text(hasMontserrat ? "IV. CẢNH BÁO KỸ THUẬT & KHUYẾN NGHỊ" : "IV. Cảnh Báo Kỹ Thuật & Khuyến Nghị", 20, yPage2);
    yPage2 += 6;

    latestReport.warningObjects.forEach((warning) => {
      const borderRGB = warning.level === "danger" ? [194, 65, 12] : (warning.level === "warning" ? [183, 121, 31] : [19, 121, 91]);
      const bgRGB = warning.level === "danger" ? [255, 241, 236] : (warning.level === "warning" ? [255, 249, 232] : [236, 251, 245]);
      const textRGB = warning.level === "danger" ? [124, 45, 18] : (warning.level === "warning" ? [113, 63, 18] : [6, 78, 59]);
      const bodyTextWrapped = doc.splitTextToSize(hasMontserrat ? warning.body : convertVietnameseAccents(warning.body), 160);
      const cardHeight = 6 + bodyTextWrapped.length * 4 + 4;
      if (yPage2 + cardHeight > 260) {
        doc.addPage();
        doc.setFillColor(15, 108, 92);
        doc.rect(20, 12, 170, 1.5, "F");
        yPage2 = 22;
      }
      doc.setFillColor(bgRGB[0], bgRGB[1], bgRGB[2]);
      doc.rect(20, yPage2, 170, cardHeight, "F");
      doc.setFillColor(borderRGB[0], borderRGB[1], borderRGB[2]);
      doc.rect(20, yPage2, 1.8, cardHeight, "F");
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(20, yPage2, 170, cardHeight, "S");
      doc.setFont(doc.getFont().fontName, "bold");
      doc.setFontSize(9);
      doc.setTextColor(textRGB[0], textRGB[1], textRGB[2]);
      doc.text(hasMontserrat ? warning.title : convertVietnameseAccents(warning.title), 25, yPage2 + 4.5);
      doc.setFont(doc.getFont().fontName, "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(bodyTextWrapped, 25, yPage2 + 9.5);
      yPage2 += cardHeight + 4;
    });

    yPage2 += 4;
    doc.setFont(doc.getFont().fontName, "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 108, 92);
    doc.text(hasMontserrat ? "V. THÀNH PHẦN SÓNG HÀI ĐẶC TRƯNG" : "V. Thành Phần Sóng Hài Đặc Trưng", 20, yPage2);
    yPage2 += 6;
    doc.setFont(doc.getFont().fontName, "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    const harmText = latestReport.harmonics.length ? latestReport.harmonics.map((h) => `H${h}`).join(", ") : "Không có";
    const pulseText = `Bậc hài ưu thế dự đoán: ${harmText}`;
    doc.text(hasMontserrat ? pulseText : convertVietnameseAccents(pulseText), 20, yPage2);

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i += 1) {
      doc.setPage(i);
      drawFooter(doc, i, pageCount, hasMontserrat);
    }

    doc.save(`MASTER-report-${Date.now()}.pdf`);
  } catch (error) {
    console.error("PDF export failed:", error);
    alert("Xuất báo cáo PDF thất bại. Mở Console để xem chi tiết lỗi.");
  }
}

function updateSpecs(primarySolution, compensatedReference, ahfCurrent, svgKvar) {
  const specs = [];
  
  // 1. Capacitor Specification
  let capVoltage = "440 V";
  if (primarySolution.reactor === "Cuộn kháng 7%") {
    capVoltage = "480 V";
  } else if (primarySolution.reactor.includes("13%") || primarySolution.reactor.includes("14%")) {
    capVoltage = "525 V";
  }
  specs.push(`
    <div class="spec-item">
      <div class="spec-header">
        <span class="spec-name">Tụ Bù Phản Kháng</span>
        <span class="spec-value">${formatNumber(compensatedReference, 0)} kVAr</span>
      </div>
      <div class="spec-desc">Điện áp định mức đề xuất: <strong>${capVoltage}</strong> (cho hệ 400V) chịu quá áp sóng hài. Tiêu chuẩn thiết kế: IEC 60831.</div>
    </div>
  `);
  
  // 2. Detuned Reactor Specification
  if (primarySolution.reactor !== "Không cần cuộn kháng") {
    specs.push(`
      <div class="spec-item">
        <div class="spec-header">
          <span class="spec-name">Cuộn Kháng Lọc Hài</span>
          <span class="spec-value">${primarySolution.reactor}</span>
        </div>
        <div class="spec-desc">Độ tuyến tính dòng điện I_lin &ge; 1.8 &times; In. Lắp nối tiếp bảo vệ tụ khỏi cộng hưởng. Tiêu chuẩn thiết kế: IEC 60076-6.</div>
      </div>
    `);
  }
  
  // 3. AHF Specification
  if (ahfCurrent > 0) {
    let suggestedAhfModule = "30 A";
    if (ahfCurrent > 30 && ahfCurrent <= 50) suggestedAhfModule = "50 A";
    else if (ahfCurrent > 50 && ahfCurrent <= 100) suggestedAhfModule = "100 A";
    else if (ahfCurrent > 100 && ahfCurrent <= 150) suggestedAhfModule = "150 A";
    else if (ahfCurrent > 150 && ahfCurrent <= 200) suggestedAhfModule = "200 A";
    else if (ahfCurrent > 200) {
      const modules = Math.ceil(ahfCurrent / 100);
      suggestedAhfModule = `${modules} x 100 A`;
    }
    specs.push(`
      <div class="spec-item">
        <div class="spec-header">
          <span class="spec-name">Bộ Lọc Tích Cực AHF</span>
          <span class="spec-value">${formatNumber(ahfCurrent, 1)} A</span>
        </div>
        <div class="spec-desc">Đề xuất sử dụng tủ module lắp ghép: <strong>${suggestedAhfModule}</strong>. Phản hồi nhanh &lt; 5ms, khử sóng hài bậc 2 đến 50, hiệu suất lọc &gt; 95%.</div>
      </div>
    `);
  }
  
  // 4. SVG Specification
  if (svgKvar > 0) {
    let suggestedSvgModule = "50 kVAr";
    if (svgKvar > 50 && svgKvar <= 100) suggestedSvgModule = "100 kVAr";
    else if (svgKvar > 100) {
      const modules = Math.ceil(svgKvar / 50);
      suggestedSvgModule = `${modules} x 50 kVAr`;
    }
    specs.push(`
      <div class="spec-item">
        <div class="spec-header">
          <span class="spec-name">Bộ Bù Tĩnh SVG</span>
          <span class="spec-value">${formatNumber(svgKvar, 1)} kVAr</span>
        </div>
        <div class="spec-desc">Đề xuất module: <strong>${suggestedSvgModule}</strong>. Bù vô cấp hai chiều siêu tốc &lt; 1ms, không gây cộng hưởng sóng hài.</div>
      </div>
    `);
  }
  
  elements.specsOutputGrid.innerHTML = specs.join("");
}

function updateCalculation() {
  try {
    latestRuntimeError = "";
    const building = buildingTypeOptions.find((item) => item.value === elements.buildingType.value);
    const importance = loadImportanceOptions.find((item) => item.value === elements.loadImportance.value);

    elements.thdiInitialOutput.textContent = `${building.thdiInitial}%`;
    elements.importanceAdvice.textContent = importance.advice;

    const activePower = getValue("activePower");
    const transformerPower = getValue("transformerPower");
    const cos1 = getValue("cos1");
    const cos2 = getValue("cos2");
    const voltage = getValue("voltage");
    const thdiTarget = getValue("thdiTarget");
    const operationHours = getValue("operationHours");
    const hasGenerator = elements.hasGenerator.value === "yes";
    const hasSolar = elements.hasSolar.value === "yes";

    // Toggle dynamic power input display
    elements.generatorPowerGroup.style.display = hasGenerator ? "flex" : "none";
    elements.solarPowerGroup.style.display = hasSolar ? "flex" : "none";

    if (!hasGenerator) {
      elements.generatorPower.value = 0;
    }
    if (!hasSolar) {
      elements.solarPower.value = 0;
    }

    const designAlerts = [];
    if (hasGenerator) {
      designAlerts.push("Khi máy phát hoạt động, toàn bộ tụ bù phải OFF. Bộ điều khiển tụ bù cần có chức năng đo và bảo vệ sóng hài, điện áp, nhiệt độ.");
    }
    if (hasSolar) {
      designAlerts.push("Hệ có solar inverter cần theo dõi tương tác sóng hài và điều chỉnh bù phù hợp với chế độ phát ngược công suất.");
    }
    if (operationHours > 12) {
      designAlerts.push("Thời gian vận hành trên 12 giờ/ngày: nên dùng bộ điều khiển có giới hạn thời gian đóng cấp bù và thời gian nghỉ tối thiểu cho từng cấp.");
    }
    renderNotes(elements.designAlerts, designAlerts);

    const rows = [...elements.loadTableBody.querySelectorAll("tr")];
    let totalDeclaredLoad = 0;
    let thdiFromLoads = 0;
    const loadRows = [];

    rows.forEach((row) => {
    const groupId = Number(row.dataset.id);
    const power = Number(row.querySelector('[data-role="power"]').value || 0);
    const ks = Number(row.querySelector('[data-role="ks"]').value || 0);
    totalDeclaredLoad += power;

    const ratioPercent = activePower > 0 ? (power / activePower) * 100 : 0;
    const thdi = thdiFromLoadGroup(groupId, ratioPercent, ks);
    thdiFromLoads += thdi;
    const groupName = loadGroups.find((item) => item.id === groupId)?.name || "";

    loadRows.push({
      id: groupId,
      name: groupName,
      power,
      ks,
      ratioPercent,
      thdi
    });

    row.querySelector('[data-role="ratio"]').textContent = `${formatNumber(ratioPercent)}%`;
    row.querySelector('[data-role="thdi"]').textContent = `${formatNumber(thdi)}%`;
    });

    const loadsValid = totalDeclaredLoad <= activePower + 1e-9;
    elements.totalDeclaredLoad.textContent = `${formatNumber(totalDeclaredLoad, 0)} kW`;
    elements.thdiFromLoads.textContent = `${formatNumber(thdiFromLoads)}%`;
    elements.loadValidation.textContent = loadsValid ? "Hợp lệ" : "Không hợp lệ";
    elements.loadValidation.classList.toggle("valid", loadsValid);
    elements.loadValidation.classList.toggle("invalid", !loadsValid);

    const thdiTotal = building.thdiInitial + thdiFromLoads;
    const mbaRecommendation = getMvaRecommendation(building, transformerPower);
    const reactiveCompensation = calculateReactiveCompensation(activePower, cos1, cos2);
    const compensatedReference = Math.min(
      Math.max(reactiveCompensation, mbaRecommendation.min),
      mbaRecommendation.max
    );

    const singlePhaseRatio = activePower > 0 ? (getValue("singlePhaseLoad") / activePower) * 100 : 0;
    const peakPower = getValue("peakPower");
    const minPower = getValue("minPower");
    const deltaPPercent = activePower > 0 ? ((peakPower - minPower) / activePower) * 100 : 0;
    const variationTime = getValue("variationTime");
    const volatility = classifyVolatility(deltaPPercent, variationTime);
  
  // Calculate exact suggested Kp range based on document logic
    const suggestedKpRange = getSuggestedKpRange(volatility.level, importance.value, building.value);
    const minKp = suggestedKpRange[0];
    const maxKp = suggestedKpRange[1];
  
  // Show interactive validation state instead of silently overwriting user inputs
    const reserveFactorInput = getValue("reserveFactor");
    const kpTooltip = document.getElementById("kpTooltip");
    const reserveFactorEl = elements.reserveFactor;

    if (kpTooltip) {
    let tooltipText = `Hệ số dự phòng an toàn cho bộ lọc AHF để chạy bền bỉ. `;
    if (reserveFactorInput < minKp || reserveFactorInput > maxKp) {
      tooltipText += `(Khuyến cáo: ${formatNumber(minKp)} - ${formatNumber(maxKp)} - Ngoài đề xuất)`;
      if (reserveFactorEl) reserveFactorEl.classList.add("warn");
    } else {
      tooltipText += `(Đề xuất: ${formatNumber(minKp)} - ${formatNumber(maxKp)})`;
      if (reserveFactorEl) reserveFactorEl.classList.remove("warn");
    }
    kpTooltip.setAttribute("title", tooltipText);
    }

    const reserveFactor = getValue("reserveFactor");
    const excessThdi = Math.max(thdiTotal - thdiTarget, 0) / 100;
    const baseCurrent = voltage > 0 && cos2 > 0 ? (activePower * 1000) / (1.73 * voltage * cos2) : 0;
    const ahfCurrent = excessThdi * baseCurrent * reserveFactor;
    const primarySolution = determinePrimarySolution(thdiTotal);

    let svgKvar = 0;
    if (primarySolution.requireSvg || volatility.level.includes("rất mạnh") || volatility.level.includes("mạnh")) {
      svgKvar = reactiveCompensation;
    }

    const recommendations = [];
    const warnings = [];

    if (!loadsValid) {
      warnings.push("Tổng công suất các nhóm tải đang lớn hơn công suất tải P. Cần hiệu chỉnh dữ liệu trước khi sử dụng kết quả.");
    }

    recommendations.push(`Giải pháp chính: ${primarySolution.label}.`);
    recommendations.push(`Công suất bù tính theo cosφ: ${formatNumber(reactiveCompensation)} kVAr.`);
    recommendations.push(`Dải công suất bù theo MBA: ${formatNumber(mbaRecommendation.min, 0)} - ${formatNumber(mbaRecommendation.max, 0)} kVAr.`);
    recommendations.push(`Mức tham chiếu để chọn tủ bù: khoảng ${formatNumber(compensatedReference, 0)} kVAr.`);
    recommendations.push(`Đánh giá tải: ${volatility.level}; tải điển hình: ${volatility.examples}.`);
    recommendations.push(`${volatility.solution}.`);

    if (ahfCurrent > 0 || primarySolution.requireAhf) {
      recommendations.push(`AHF tham chiếu: ${formatNumber(ahfCurrent)} A. Nên chọn cấp module thương mại lớn hơn gần nhất.`);
    }

    if (svgKvar > 0) {
      recommendations.push(`SVG tham chiếu: ${formatNumber(svgKvar)} kVAr để bám tải nhanh khi cosφ và công suất biến động lớn.`);
    }

    if (singlePhaseRatio > 40) {
      warnings.push("Tải 1 pha vượt 40% công suất hệ thống. Cần lưu ý hài bậc 3 và dòng trung tính, nên xem xét AHF.");
    }
    if (thdiTotal > 40) {
      warnings.push("THDi dự đoán vượt 40%. Khuyến nghị khảo sát chất lượng điện năng sau khi công trình đi vào vận hành.");
    }
    if (hasGenerator) {
      warnings.push("Phải khóa liên động hoặc cài logic để tụ bù không đóng khi nguồn máy phát đang vận hành.");
    }
    if (getValue("ukPercent") < 5) {
      warnings.push("Uk% MBA thấp có thể làm tăng rủi ro cộng hưởng. Cần kiểm tra cộng hưởng song song khi chọn tụ bù và reactor.");
    }
    if (elements.wiringDiagram.value === "3P4W" && singlePhaseRatio > 25) {
      warnings.push("Hệ 3P4W với tải phi tuyến 1 pha đáng kể cần kiểm tra tiết diện dây trung tính và phát nhiệt tủ.");
    }
    if (cos2 <= cos1) {
      warnings.push("Cosφ sau bù nên lớn hơn cosφ trước bù để phép tính công suất bù có ý nghĩa.");
    }

    renderList(elements.mainRecommendations, recommendations, "Chưa có khuyến nghị.");
    renderList(elements.technicalWarnings, warnings, "Chưa phát hiện cảnh báo kỹ thuật nổi bật với dữ liệu hiện tại.");

    elements.deltaPowerOutput.textContent = `${formatNumber(deltaPPercent)}%`;
    elements.reactiveCompensationOutput.textContent = `${formatNumber(reactiveCompensation)} kVAr`;
    elements.compensationMethodOutput.textContent = `Phương pháp: ${elements.compensationMethod.options[elements.compensationMethod.selectedIndex].text}`;
    elements.mvaCompensationRange.textContent = `${formatNumber(mbaRecommendation.min, 0)} - ${formatNumber(mbaRecommendation.max, 0)} kVAr`;
    elements.mvaCompensationSelection.textContent = `Tham chiếu chọn: ${formatNumber(compensatedReference, 0)} kVAr`;
    elements.reactorOutput.textContent = primarySolution.reactor;
    elements.reactorReason.textContent = primarySolution.reason;
    elements.ahfOutput.textContent = `${formatNumber(ahfCurrent)} A`;
    elements.ahfReason.textContent = excessThdi > 0 ? `Theo công thức AHF với Kp = ${formatNumber(reserveFactor)}.` : "THDi hiện chưa vượt mục tiêu.";
    elements.svgOutput.textContent = `${formatNumber(svgKvar)} kVAr`;
    elements.svgReason.textContent = svgKvar > 0 ? "Nên dùng cho tải biến động nhanh hoặc THDi cao." : "Chưa cần SVG với dữ liệu hiện tại.";
    elements.volatilityLevelOutput.textContent = volatility.level;
    elements.kpRangeOutput.textContent = `Kp tham chiếu: ${formatNumber(minKp)} - ${formatNumber(maxKp)}`;

    elements.summaryThdi.textContent = `${formatNumber(thdiTotal)}%`;
    elements.summaryCompensation.textContent = `${formatNumber(compensatedReference, 0)} kVAr`;
    elements.summaryAhf.textContent = `${formatNumber(ahfCurrent)} A`;
    elements.summaryPrimary.textContent = primarySolution.label;
  
    // Render Dynamic Technical Specs
    updateSpecs(primarySolution, compensatedReference, ahfCurrent, svgKvar);

    const blockingIssues = [];
    if (transformerPower <= 0) blockingIssues.push("Cần nhập công suất MBA lớn hơn 0.");
    if (activePower <= 0) blockingIssues.push("Cần nhập công suất tải P lớn hơn 0.");
    if (voltage <= 0) blockingIssues.push("Cần nhập điện áp hệ thống U lớn hơn 0.");
    if (thdiTarget <= 0) blockingIssues.push("Cần nhập THDi mục tiêu lớn hơn 0.");
    if (totalDeclaredLoad <= 0) blockingIssues.push("Cần khai báo ít nhất một nhóm tải có công suất > 0.");
    if (!loadsValid) blockingIssues.push("Tổng công suất các nhóm tải đang vượt quá công suất tải P.");
    if (cos2 <= cos1) blockingIssues.push("Cosφ mục tiêu sau bù phải lớn hơn cosφ trước bù.");
    if (peakPower < minPower) blockingIssues.push("Pmax phải lớn hơn hoặc bằng Pmin.");
    latestBlockingIssues = blockingIssues;

    if (blockingIssues.length) {
      latestReport = null;
      if (exportAttempted) {
        showExportIssues("pdf");
      } else {
        hideExportState();
      }
      return;
    }

    collectCurrentReport({
      building,
      importance,
      activePower,
      transformerPower,
      cos1,
      cos2,
      voltage,
      thdiTarget,
      operationHours,
      hasGenerator,
      hasSolar,
      totalDeclaredLoad,
      thdiFromLoads,
      thdiTotal,
      mbaRecommendation,
      reactiveCompensation,
      compensatedReference,
      singlePhaseRatio,
      deltaPPercent,
      variationTime,
      volatility,
      kpRange: [minKp, maxKp],
      reserveFactor,
      ahfCurrent,
      primarySolution,
      svgKvar,
      loadsValid,
      designAlerts,
      recommendations,
      warnings,
      loadRows
    });

    if (exportAttempted) {
      hideExportState();
    } else {
      hideExportState();
    }
  } catch (error) {
    latestReport = null;
    latestBlockingIssues = [];
    latestRuntimeError = error.message || String(error);
    console.error("updateCalculation failed:", error);
    if (exportAttempted) {
      showExportIssues("pdf");
    } else {
      hideExportState();
    }
  }
}

function init() {
  [
    "projectName",
    "buildingType",
    "loadImportance",
    "loadTableBody",
    "thdiInitialOutput",
    "importanceAdvice",
    "designAlerts",
    "totalDeclaredLoad",
    "thdiFromLoads",
    "loadValidation",
    "deltaPowerOutput",
    "reactiveCompensationOutput",
    "compensationMethodOutput",
    "mvaCompensationRange",
    "mvaCompensationSelection",
    "reactorOutput",
    "reactorReason",
    "ahfOutput",
    "ahfReason",
    "svgOutput",
    "svgReason",
    "volatilityLevelOutput",
    "kpRangeOutput",
    "summaryThdi",
    "summaryCompensation",
    "summaryAhf",
    "summaryPrimary",
    "mainRecommendations",
    "technicalWarnings",
    "reportStatusBanner",
    "reportStatusList",
    "exportPdfButton",
    "exportWordButton",
    "printReportBtn",
    "activePower",
    "transformerPower",
    "parallelTransformers",
    "usageFactor",
    "coincidenceFactor",
    "cos1",
    "cos2",
    "voltage",
    "thduTarget",
    "thdiTarget",
    "operationHours",
    "hasGenerator",
    "generatorPower",
    "generatorPowerGroup",
    "hasSolar",
    "solarPower",
    "solarPowerGroup",
    "ukPercent",
    "singlePhaseLoad",
    "peakPower",
    "minPower",
    "variationTime",
    "reserveFactor",
    "kpTooltip",
    "compensationMethod",
    "wiringDiagram",
    "frequency",
    "specsOutputGrid"
  ].forEach((id) => {
    elements[id] = document.getElementById(id);
  });

  populateSelect(elements.buildingType, buildingTypeOptions);
  populateSelect(elements.loadImportance, loadImportanceOptions);
  elements.buildingType.value = "plastic-factory";
  elements.loadImportance.value = "III";

  buildLoadTable();
  hideExportState();

  const form = document.getElementById("calculatorForm");
  form.addEventListener("input", updateCalculation);
  form.addEventListener("change", updateCalculation);
  elements.printReportBtn.addEventListener("click", () => window.print());
  elements.exportPdfButton.addEventListener("click", exportPdf);
  elements.exportWordButton.addEventListener("click", exportWord);

  elements.kpTooltip.addEventListener("click", (e) => {
    e.preventDefault();
    const reserveFactorInput = getValue("reserveFactor");
    const building = buildingTypeOptions.find((item) => item.value === elements.buildingType.value);
    const importance = loadImportanceOptions.find((item) => item.value === elements.loadImportance.value);
    
    const activePower = getValue("activePower");
    const peakPower = getValue("peakPower");
    const minPower = getValue("minPower");
    const deltaPPercent = activePower > 0 ? ((peakPower - minPower) / activePower) * 100 : 0;
    const variationTime = getValue("variationTime");
    const volatility = classifyVolatility(deltaPPercent, variationTime);
    
    const suggestedKpRange = getSuggestedKpRange(volatility.level, importance.value, building.value);
    const minKp = suggestedKpRange[0];
    const maxKp = suggestedKpRange[1];

    let message = "Hệ số dự phòng an toàn cho bộ lọc AHF để chạy bền bỉ.\n\n";
    if (reserveFactorInput < minKp || reserveFactorInput > maxKp) {
      message += `(Khuyến cáo: ${formatNumber(minKp)} - ${formatNumber(maxKp)} - Ngoài đề xuất)`;
    } else {
      message += `(Đề xuất: ${formatNumber(minKp)} - ${formatNumber(maxKp)})`;
    }
    alert(message);
  });

  updateCalculation();
}

document.addEventListener("DOMContentLoaded", init);
