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

  rows.forEach((row) => {
    const groupId = Number(row.dataset.id);
    const power = Number(row.querySelector('[data-role="power"]').value || 0);
    const ks = Number(row.querySelector('[data-role="ks"]').value || 0);
    totalDeclaredLoad += power;

    const ratioPercent = activePower > 0 ? (power / activePower) * 100 : 0;
    const thdi = thdiFromLoadGroup(groupId, ratioPercent, ks);
    thdiFromLoads += thdi;

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
}

function init() {
  [
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
    "printReportBtn",
    "activePower",
    "transformerPower",
    "cos1",
    "cos2",
    "voltage",
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
    "compensationMethod",
    "wiringDiagram",
    "frequency",
    "specsOutputGrid",
    "recalculateBtn",
    "kpTooltip"
  ].forEach((id) => {
    elements[id] = document.getElementById(id);
  });

  populateSelect(elements.buildingType, buildingTypeOptions);
  populateSelect(elements.loadImportance, loadImportanceOptions);
  elements.buildingType.value = "plastic-factory";
  elements.loadImportance.value = "III";

  buildLoadTable();

  const form = document.getElementById("calculatorForm");
  form.addEventListener("input", updateCalculation);
  form.addEventListener("change", updateCalculation);
  elements.printReportBtn.addEventListener("click", () => window.print());

  elements.recalculateBtn.addEventListener("click", (e) => {
    e.preventDefault();
    updateCalculation();
    const btn = elements.recalculateBtn;
    btn.classList.add("calculating");
    setTimeout(() => btn.classList.remove("calculating"), 500);
  });

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
