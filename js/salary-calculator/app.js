"use strict";

const TAX_YEAR = 2026;
const STORAGE_KEY = "atlyginimas-calendar-v4";

const RATES = Object.freeze({
  gpm: 0.20,
  sodra: 0.195,
  secondPillar: 0.03,
  night: 1.5,
  holiday: 2
});

const NPD = Object.freeze({
  monthlyMaximum: 747,
  monthlyMma: 1153,
  monthlyReduction: 0.49,

  annualMaximum: 8964,
  annualMma: 13836,
  annualReduction: 0.49
});

const GPM_LIMITS = Object.freeze({
  first: 83237.40,
  second: 138729
});

const MONTHS = Object.freeze([
  "Sausis",
  "Vasaris",
  "Kovas",
  "Balandis",
  "Gegužė",
  "Birželis",
  "Liepa",
  "Rugpjūtis",
  "Rugsėjis",
  "Spalis",
  "Lapkritis",
  "Gruodis"
]);

const euroFormatter = new Intl.NumberFormat("lt-LT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const numberFormatter = new Intl.NumberFormat("lt-LT", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

function getElement(id) {
  return document.getElementById(id);
}

const elements = {
  modeTabs: [...document.querySelectorAll(".mode-tab")],

  salaryMode: getElement("salaryMode"),
  hourlyMode: getElement("hourlyMode"),

  salary: getElement("salary"),
  hourlyRate: getElement("hourlyRate"),

  previousMonth: getElement("previousMonth"),
  monthTitle: getElement("monthTitle"),
  nextMonth: getElement("nextMonth"),
  yearViewButton: getElement("yearViewButton"),

  monthView: getElement("monthView"),
  yearView: getElement("yearView"),

  calendarGrid: getElement("calendarGrid"),
  holidayList: getElement("holidayList"),

  selectionCount: getElement("selectionCount"),
  selectWeekdays: getElement("selectWeekdays"),
  selectAllDays: getElement("selectAllDays"),
  selectWorkedDays: getElement("selectWorkedDays"),
  clearSelection: getElement("clearSelection"),

  bulkDayHours: getElement("bulkDayHours"),
  bulkNightHours: getElement("bulkNightHours"),
  applyCustomShift: getElement("applyCustomShift"),

  regularHoursTotal: getElement("regularHoursTotal"),
  nightHoursTotal: getElement("nightHoursTotal"),
  holidayHoursTotal: getElement("holidayHoursTotal"),
  monthGrossTotal: getElement("monthGrossTotal"),

  yearTable: getElement("yearTable"),

  bonusSection: getElement("bonusSection"),
  bonusList: getElement("bonusList"),
  addBonus: getElement("addBonus"),

  useNpd: getElement("useNpd"),
  pension: getElement("pension"),

  resultNpd: getElement("resultNpd"),
  springRow: getElement("springRow"),
  springLabel: getElement("springLabel"),
  springRefund: getElement("springRefund"),

  netPay: getElement("netPay"),

  grossTotal: getElement("grossTotal"),
  baseGross: getElement("baseGross"),

  hoursBreakdown: getElement("hoursBreakdown"),
  hoursValue: getElement("hoursValue"),

  bonusTotalRow: getElement("bonusTotalRow"),
  bonusTotal: getElement("bonusTotal"),

  bonusNetRow: getElement("bonusNetRow"),
  bonusNet: getElement("bonusNet"),

  bonusLossRow: getElement("bonusLossRow"),
  bonusLossPercent: getElement("bonusLossPercent"),
  bonusLoss: getElement("bonusLoss"),

  npdValue: getElement("npdValue"),

  gpm: getElement("gpm"),
  sodra: getElement("sodra"),

  secondPillarRow: getElement("secondPillarRow"),
  secondPillar: getElement("secondPillar"),

  totalTax: getElement("totalTax"),
  netBottom: getElement("netBottom")
};

function createDefaultState() {
  const currentDate = new Date();

  return {
    mode: "salary",
    view: "month",

    currentMonth:
      currentDate.getFullYear() === TAX_YEAR
        ? currentDate.getMonth()
        : 0,

    salary: 2000,
    hourlyRate: 10,

    useNpd: true,
    pension: false,

    shifts: {},
    bonuses: {
      salary: []
    }
  };
}

function loadState() {
  const defaultState = createDefaultState();

  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    );

    if (!saved || typeof saved !== "object") {
      return defaultState;
    }

    return {
      ...defaultState,
      ...saved,

      shifts:
        saved.shifts && typeof saved.shifts === "object"
          ? saved.shifts
          : {},

      bonuses:
        saved.bonuses && typeof saved.bonuses === "object"
          ? saved.bonuses
          : {
              salary: []
            }
    };
  } catch {
    return defaultState;
  }
}

const state = loadState();

state.currentMonth = Math.min(
  11,
  Math.max(0, Number(state.currentMonth) || 0)
);

const selectedDates = new Set();

let lastSelectedDate = null;

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}

function parsePositiveNumber(value) {
  const parsed = Number.parseFloat(
    String(value).replace(",", ".")
  );

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function money(value) {
  return euroFormatter.format(
    Math.max(0, Number(value) || 0)
  );
}

function signedMoney(value) {
  const safeValue = Number(value) || 0;

  if (safeValue > 0) {
    return `+${money(safeValue)}`;
  }

  if (safeValue < 0) {
    return `−${money(Math.abs(safeValue))}`;
  }

  return money(0);
}

function loss(value) {
  return `−${money(value)}`;
}

function formatNumber(value) {
  return numberFormatter.format(
    Math.max(0, Number(value) || 0)
  );
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function getDateKey(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function getMonthKey(month) {
  return `${TAX_YEAR}-${pad(month + 1)}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getMondayIndex(date) {
  return (date.getDay() + 6) % 7;
}

function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);

  const h =
    (
      19 * a +
      b -
      d -
      g +
      15
    ) % 30;

  const i = Math.floor(c / 4);
  const k = c % 4;

  const l =
    (
      32 +
      2 * e +
      2 * i -
      h -
      k
    ) % 7;

  const m = Math.floor(
    (
      a +
      11 * h +
      22 * l
    ) / 451
  );

  const month = Math.floor(
    (
      h +
      l -
      7 * m +
      114
    ) / 31
  );

  const day =
    (
      h +
      l -
      7 * m +
      114
    ) % 31 + 1;

  return new Date(year, month - 1, day);
}

function getFirstSunday(year, month) {
  const firstDay = new Date(year, month, 1);
  const dayOffset = (7 - firstDay.getDay()) % 7;

  return 1 + dayOffset;
}

function getLithuanianHolidays(year) {
  const holidays = new Map();

  function add(month, day, name) {
    holidays.set(
      getDateKey(year, month, day),
      name
    );
  }

  add(0, 1, "Naujieji metai");
  add(1, 16, "Lietuvos valstybės atkūrimo diena");
  add(2, 11, "Lietuvos nepriklausomybės atkūrimo diena");

  const easter = getEasterDate(year);

  add(
    easter.getMonth(),
    easter.getDate(),
    "Velykų sekmadienis"
  );

  const easterMonday = new Date(
    easter.getFullYear(),
    easter.getMonth(),
    easter.getDate() + 1
  );

  add(
    easterMonday.getMonth(),
    easterMonday.getDate(),
    "Velykų pirmadienis"
  );

  add(4, 1, "Tarptautinė darbo diena");

  add(
    4,
    getFirstSunday(year, 4),
    "Motinos diena"
  );

  add(
    5,
    getFirstSunday(year, 5),
    "Tėvo diena"
  );

  add(5, 24, "Rasos ir Joninių diena");

  add(
    6,
    6,
    "Valstybės ir Tautiškos giesmės diena"
  );

  add(7, 15, "Žolinė");
  add(10, 1, "Visų Šventųjų diena");
  add(10, 2, "Vėlinės");
  add(11, 24, "Kūčios");
  add(11, 25, "Kalėdos");
  add(11, 26, "Antroji Kalėdų diena");

  return holidays;
}

const holidays = getLithuanianHolidays(TAX_YEAR);

function calculateMonthlyNpd(gross) {
  if (gross <= 0) {
    return 0;
  }

  const calculated =
    gross <= NPD.monthlyMma
      ? NPD.monthlyMaximum
      : NPD.monthlyMaximum -
        NPD.monthlyReduction *
        (gross - NPD.monthlyMma);

  return Math.min(
    gross,
    Math.max(0, calculated)
  );
}

function calculateAnnualNpd(gross) {
  if (gross <= 0) {
    return 0;
  }

  const calculated =
    gross <= NPD.annualMma
      ? NPD.annualMaximum
      : NPD.annualMaximum -
        NPD.annualReduction *
        (gross - NPD.annualMma);

  return Math.min(
    gross,
    Math.max(0, calculated)
  );
}

function calculateAnnualGpm(gross, annualNpd) {
  const taxable = Math.max(
    0,
    gross - annualNpd
  );

  const firstPart = Math.min(
    taxable,
    GPM_LIMITS.first
  );

  const secondPart = Math.min(
    Math.max(
      0,
      taxable - GPM_LIMITS.first
    ),
    GPM_LIMITS.second -
      GPM_LIMITS.first
  );

  const thirdPart = Math.max(
    0,
    taxable - GPM_LIMITS.second
  );

  return (
    firstPart * 0.20 +
    secondPart * 0.25 +
    thirdPart * 0.32
  );
}

function calculateMonthlyTaxes(
  baseGross,
  bonusGross = 0
) {
  const gross = baseGross + bonusGross;

  const legalNpd = calculateMonthlyNpd(gross);

  const appliedNpd = state.useNpd
    ? legalNpd
    : 0;

  const gpm =
    Math.max(0, gross - appliedNpd) *
    RATES.gpm;

  const sodra =
    gross * RATES.sodra;

  const secondPillar =
    state.pension
      ? gross * RATES.secondPillar
      : 0;

  const totalTax =
    gpm +
    sodra +
    secondPillar;

  const net =
    gross -
    totalTax;

  return {
    gross,
    legalNpd,
    appliedNpd,
    gpm,
    sodra,
    secondPillar,
    totalTax,
    net
  };
}

function getBonusStorageKey() {
  if (state.mode === "salary") {
    return "salary";
  }

  return getMonthKey(state.currentMonth);
}

function getBonusesForKey(key) {
  const bonuses = state.bonuses[key];

  return Array.isArray(bonuses)
    ? bonuses
    : [];
}

function getBonusTotal(key) {
  return getBonusesForKey(key).reduce(
    (total, bonus) =>
      total + parsePositiveNumber(bonus),
    0
  );
}

function getHourlyMonthData(month) {
  const hourlyRate =
    parsePositiveNumber(state.hourlyRate);

  const daysInMonth =
    getDaysInMonth(TAX_YEAR, month);

  let regularHours = 0;
  let nightHours = 0;
  let holidayHours = 0;

  let baseGross = 0;

  for (
    let day = 1;
    day <= daysInMonth;
    day += 1
  ) {
    const dateKey =
      getDateKey(TAX_YEAR, month, day);

    const shift = state.shifts[dateKey];

    if (!shift) {
      continue;
    }

    const dayHours =
      parsePositiveNumber(shift.day);

    const nightShiftHours =
      parsePositiveNumber(shift.night);

    const totalHours =
      dayHours + nightShiftHours;

    regularHours += dayHours;
    nightHours += nightShiftHours;

    if (holidays.has(dateKey)) {
      holidayHours += totalHours;

      baseGross +=
        totalHours *
        hourlyRate *
        RATES.holiday;
    } else {
      baseGross +=
        dayHours *
        hourlyRate;

      baseGross +=
        nightShiftHours *
        hourlyRate *
        RATES.night;
    }
  }

  return {
    regularHours,
    nightHours,
    holidayHours,

    totalHours:
      regularHours +
      nightHours,

    baseGross
  };
}

function createMonthSummary(month) {
  const hourlyData =
    getHourlyMonthData(month);

  const bonusKey =
    getMonthKey(month);

  const bonusGross =
    getBonusTotal(bonusKey);

  const taxes = calculateMonthlyTaxes(
    hourlyData.baseGross,
    bonusGross
  );

  const taxesWithoutBonus =
    calculateMonthlyTaxes(
      hourlyData.baseGross,
      0
    );

  const bonusNet = Math.max(
    0,
    taxes.net -
      taxesWithoutBonus.net
  );

  const bonusLoss = Math.max(
    0,
    bonusGross -
      bonusNet
  );

  return {
    month,

    ...hourlyData,
    ...taxes,

    baseGross: hourlyData.baseGross,

    bonusGross,
    bonusNet,
    bonusLoss
  };
}

function createSalarySummary() {
  const baseGross =
    parsePositiveNumber(state.salary);

  const bonusGross =
    getBonusTotal("salary");

  const taxes =
    calculateMonthlyTaxes(
      baseGross,
      bonusGross
    );

  const taxesWithoutBonus =
    calculateMonthlyTaxes(
      baseGross,
      0
    );

  const bonusNet = Math.max(
    0,
    taxes.net -
      taxesWithoutBonus.net
  );

  const bonusLoss = Math.max(
    0,
    bonusGross -
      bonusNet
  );

  return {
    isYear: false,

    baseGross,

    regularHours: 0,
    nightHours: 0,
    holidayHours: 0,
    totalHours: 0,

    ...taxes,

    bonusGross,
    bonusNet,
    bonusLoss,

    springAdjustment:
      state.useNpd
        ? 0
        : taxes.legalNpd *
          RATES.gpm
  };
}

function createCurrentMonthSummary() {
  const monthSummary =
    createMonthSummary(state.currentMonth);

  return {
    isYear: false,

    ...monthSummary,

    springAdjustment:
      state.useNpd
        ? 0
        : monthSummary.legalNpd *
          RATES.gpm
  };
}

function createYearSummary() {
  const months = Array.from(
    {
      length: 12
    },
    (_, month) =>
      createMonthSummary(month)
  );

  const total = {
    isYear: true,

    months,

    baseGross: 0,
    gross: 0,

    regularHours: 0,
    nightHours: 0,
    holidayHours: 0,
    totalHours: 0,

    bonusGross: 0,
    bonusNet: 0,
    bonusLoss: 0,

    legalNpd: 0,
    appliedNpd: 0,

    gpm: 0,
    sodra: 0,
    secondPillar: 0,

    totalTax: 0,
    net: 0
  };

  for (const month of months) {
    total.baseGross += month.baseGross;
    total.gross += month.gross;

    total.regularHours +=
      month.regularHours;

    total.nightHours +=
      month.nightHours;

    total.holidayHours +=
      month.holidayHours;

    total.totalHours +=
      month.totalHours;

    total.bonusGross +=
      month.bonusGross;

    total.bonusNet +=
      month.bonusNet;

    total.bonusLoss +=
      month.bonusLoss;

    total.appliedNpd +=
      month.appliedNpd;

    total.gpm += month.gpm;
    total.sodra += month.sodra;

    total.secondPillar +=
      month.secondPillar;

    total.totalTax +=
      month.totalTax;

    total.net += month.net;
  }

  total.legalNpd =
    calculateAnnualNpd(total.gross);

  const annualGpm =
    calculateAnnualGpm(
      total.gross,
      total.legalNpd
    );

  total.springAdjustment =
    total.gpm -
    annualGpm;

  return total;
}

function getVisibleSummary() {
  if (state.mode === "salary") {
    return createSalarySummary();
  }

  if (state.view === "year") {
    return createYearSummary();
  }

  return createCurrentMonthSummary();
}

function getShiftText(shift, isHoliday) {
  if (!shift) {
    return "";
  }

  const dayHours =
    parsePositiveNumber(shift.day);

  const nightHours =
    parsePositiveNumber(shift.night);

  const totalHours =
    dayHours + nightHours;

  if (totalHours === 0) {
    return "";
  }

  if (isHoliday) {
    return `${formatNumber(totalHours)} h ×2`;
  }

  if (dayHours > 0 && nightHours > 0) {
    return (
      `${formatNumber(dayHours)}` +
      ` + ${formatNumber(nightHours)} n.`
    );
  }

  if (nightHours > 0) {
    return `${formatNumber(nightHours)} n.`;
  }

  return `${formatNumber(dayHours)} h`;
}

function renderCalendar() {
  elements.calendarGrid.innerHTML = "";

  const firstDay =
    new Date(
      TAX_YEAR,
      state.currentMonth,
      1
    );

  const emptyCells =
    getMondayIndex(firstDay);

  for (
    let index = 0;
    index < emptyCells;
    index += 1
  ) {
    const empty =
      document.createElement("div");

    empty.className = "calendar-empty";

    elements.calendarGrid.append(empty);
  }

  const daysInMonth =
    getDaysInMonth(
      TAX_YEAR,
      state.currentMonth
    );

  for (
    let day = 1;
    day <= daysInMonth;
    day += 1
  ) {
    const date =
      new Date(
        TAX_YEAR,
        state.currentMonth,
        day
      );

    const dateKey =
      getDateKey(
        TAX_YEAR,
        state.currentMonth,
        day
      );

    const holidayName =
      holidays.get(dateKey);

    const shift =
      state.shifts[dateKey];

    const totalHours = shift
      ? parsePositiveNumber(shift.day) +
        parsePositiveNumber(shift.night)
      : 0;

    const button =
      document.createElement("button");

    button.type = "button";
    button.className = "calendar-day";

    if (
      date.getDay() === 0 ||
      date.getDay() === 6
    ) {
      button.classList.add("weekend");
    }

    if (holidayName) {
      button.classList.add("holiday");
    }

    if (selectedDates.has(dateKey)) {
      button.classList.add("selected");
    }

    if (totalHours > 0) {
      button.classList.add("has-shift");
    }

    const titleParts = [
      `${day} ${MONTHS[state.currentMonth].toLowerCase()}`
    ];

    if (holidayName) {
      titleParts.push(holidayName);
      titleParts.push("darbas ×2");
    }

    button.title = titleParts.join(" · ");

    button.innerHTML = `
      <span class="day-number">${day}</span>

      ${
        holidayName
          ? `<span class="holiday-badge">×2</span>`
          : ""
      }

      <span class="day-shift">
        ${getShiftText(
          shift,
          Boolean(holidayName)
        )}
      </span>
    `;

    button.addEventListener(
      "click",
      event => {
        selectCalendarDate(
          dateKey,
          day,
          event.shiftKey
        );
      }
    );

    elements.calendarGrid.append(button);
  }

  renderHolidayList();
  renderSelectionCount();
  renderMonthTotals();
}

function selectCalendarDate(
  dateKey,
  day,
  isRangeSelection
) {
  if (
    isRangeSelection &&
    lastSelectedDate !== null
  ) {
    const start = Math.min(
      lastSelectedDate,
      day
    );

    const end = Math.max(
      lastSelectedDate,
      day
    );

    for (
      let selectedDay = start;
      selectedDay <= end;
      selectedDay += 1
    ) {
      selectedDates.add(
        getDateKey(
          TAX_YEAR,
          state.currentMonth,
          selectedDay
        )
      );
    }
  } else if (selectedDates.has(dateKey)) {
    selectedDates.delete(dateKey);
  } else {
    selectedDates.add(dateKey);
  }

  lastSelectedDate = day;

  renderCalendar();
}

function renderHolidayList() {
  elements.holidayList.innerHTML = "";

  const monthPrefix =
    `${TAX_YEAR}-` +
    `${pad(state.currentMonth + 1)}-`;

  const monthHolidays = [
    ...holidays.entries()
  ].filter(([dateKey]) =>
    dateKey.startsWith(monthPrefix)
  );

  for (
    const [dateKey, holidayName]
    of monthHolidays
  ) {
    const item =
      document.createElement("span");

    item.className = "holiday-name";

    item.textContent =
      `${dateKey.slice(-2)} · ${holidayName}`;

    elements.holidayList.append(item);
  }
}

function renderSelectionCount() {
  const count = selectedDates.size;

  elements.selectionCount.textContent =
    count === 1
      ? "1 pasirinkta"
      : `${count} pasirinkta`;
}

function renderMonthTotals() {
  const summary =
    createMonthSummary(
      state.currentMonth
    );

  elements.regularHoursTotal.textContent =
    formatNumber(summary.regularHours);

  elements.nightHoursTotal.textContent =
    formatNumber(summary.nightHours);

  elements.holidayHoursTotal.textContent =
    formatNumber(summary.holidayHours);

  elements.monthGrossTotal.textContent =
    money(summary.baseGross);
}

function countHolidaysInMonth(month) {
  const monthPrefix =
    `${TAX_YEAR}-${pad(month + 1)}-`;

  return [...holidays.keys()].filter(
    dateKey =>
      dateKey.startsWith(monthPrefix)
  ).length;
}

function renderYearTable() {
  elements.yearTable.innerHTML = "";

  const summary = createYearSummary();

  for (const month of summary.months) {
    const row =
      document.createElement("button");

    row.type = "button";
    row.className = "year-row";

    const holidayCount =
      countHolidaysInMonth(month.month);

    row.innerHTML = `
      <span class="year-month">
        ${MONTHS[month.month]}

        <small class="year-holidays">
          ${holidayCount}
        </small>
      </span>

      <span>
        ${formatNumber(month.totalHours)}
      </span>

      <span>
        ${money(month.gross)}
      </span>

      <span>
        ${money(month.net)}
      </span>
    `;

    row.addEventListener("click", () => {
      state.currentMonth = month.month;
      state.view = "month";

      selectedDates.clear();
      lastSelectedDate = null;

      saveState();
      renderAll();
    });

    elements.yearTable.append(row);
  }
}

function renderBonuses() {
  elements.bonusList.innerHTML = "";

  const key = getBonusStorageKey();
  const bonuses = getBonusesForKey(key);

  bonuses.forEach((bonus, index) => {
    const item =
      document.createElement("div");

    item.className = "bonus-item";

    item.innerHTML = `
      <span class="money-input">
        <input
          type="number"
          min="0"
          step="0.01"
          inputmode="decimal"
          value="${parsePositiveNumber(bonus)}"
          aria-label="Premija"
        >

        <b>€</b>
      </span>

      <button
        class="remove-btn"
        type="button"
        aria-label="Pašalinti premiją"
      >
        ×
      </button>
    `;

    const input =
      item.querySelector("input");

    const removeButton =
      item.querySelector("button");

    input.addEventListener("input", () => {
      state.bonuses[key][index] =
        parsePositiveNumber(input.value);

      saveState();
      renderResults();
      renderMonthTotals();
    });

    removeButton.addEventListener(
      "click",
      () => {
        state.bonuses[key].splice(
          index,
          1
        );

        saveState();
        renderBonuses();
        renderResults();
        renderMonthTotals();
      }
    );

    elements.bonusList.append(item);
  });
}

function addBonus() {
  const key = getBonusStorageKey();

  if (!Array.isArray(state.bonuses[key])) {
    state.bonuses[key] = [];
  }

  state.bonuses[key].push(0);

  saveState();
  renderBonuses();
  renderResults();

  const inputs =
    elements.bonusList.querySelectorAll(
      "input"
    );

  inputs[inputs.length - 1]?.focus();
}

function selectWeekdays() {
  selectedDates.clear();

  const daysInMonth =
    getDaysInMonth(
      TAX_YEAR,
      state.currentMonth
    );

  for (
    let day = 1;
    day <= daysInMonth;
    day += 1
  ) {
    const date =
      new Date(
        TAX_YEAR,
        state.currentMonth,
        day
      );

    const dateKey =
      getDateKey(
        TAX_YEAR,
        state.currentMonth,
        day
      );

    const isWeekday =
      date.getDay() >= 1 &&
      date.getDay() <= 5;

    const isHoliday =
      holidays.has(dateKey);

    if (isWeekday && !isHoliday) {
      selectedDates.add(dateKey);
    }
  }

  renderCalendar();
}

function selectAllDays() {
  selectedDates.clear();

  const daysInMonth =
    getDaysInMonth(
      TAX_YEAR,
      state.currentMonth
    );

  for (
    let day = 1;
    day <= daysInMonth;
    day += 1
  ) {
    selectedDates.add(
      getDateKey(
        TAX_YEAR,
        state.currentMonth,
        day
      )
    );
  }

  renderCalendar();
}

function selectWorkedDays() {
  selectedDates.clear();

  const monthPrefix =
    `${TAX_YEAR}-` +
    `${pad(state.currentMonth + 1)}-`;

  for (
    const [dateKey, shift]
    of Object.entries(state.shifts)
  ) {
    if (!dateKey.startsWith(monthPrefix)) {
      continue;
    }

    const totalHours =
      parsePositiveNumber(shift.day) +
      parsePositiveNumber(shift.night);

    if (totalHours > 0) {
      selectedDates.add(dateKey);
    }
  }

  renderCalendar();
}

function clearSelection() {
  selectedDates.clear();
  lastSelectedDate = null;

  renderCalendar();
}

function applyShiftToSelected(
  dayHours,
  nightHours
) {
  const safeDayHours =
    Math.min(
      24,
      parsePositiveNumber(dayHours)
    );

  const safeNightHours =
    Math.min(
      24,
      parsePositiveNumber(nightHours)
    );

  if (selectedDates.size === 0) {
    return;
  }

  for (const dateKey of selectedDates) {
    if (
      safeDayHours === 0 &&
      safeNightHours === 0
    ) {
      delete state.shifts[dateKey];
    } else {
      state.shifts[dateKey] = {
        day: safeDayHours,
        night: safeNightHours
      };
    }
  }

  selectedDates.clear();
  lastSelectedDate = null;

  saveState();

  renderCalendar();
  renderResults();

  if (state.view === "year") {
    renderYearTable();
  }
}

function renderResults() {
  const summary = getVisibleSummary();

  const bonusLossPercentage =
    summary.bonusGross > 0
      ? (
          summary.bonusLoss /
          summary.bonusGross
        ) * 100
      : 0;

  elements.resultNpd.textContent =
    money(summary.legalNpd);

  const springAdjustment =
    summary.springAdjustment;

  const showSpring =
    Math.abs(springAdjustment) >= 0.01;

  elements.springRow.classList.toggle(
    "hidden",
    !showSpring
  );

  elements.springRow.classList.toggle(
    "negative-adjustment",
    springAdjustment < 0
  );

  elements.springLabel.textContent =
    springAdjustment < 0
      ? "Primokėti"
      : "Pavasarį";

  elements.springRefund.textContent =
    signedMoney(springAdjustment);

  elements.netPay.textContent =
    money(summary.net);

  elements.grossTotal.textContent =
    money(summary.gross);

  elements.baseGross.textContent =
    money(summary.baseGross);

  const showHours =
    state.mode === "hourly";

  elements.hoursBreakdown.classList.toggle(
    "hidden",
    !showHours
  );

  elements.hoursValue.textContent =
    summary.isYear
      ? (
          `${formatNumber(summary.totalHours)} h` +
          ` · ${formatNumber(summary.holidayHours)} šv.`
        )
      : `${formatNumber(summary.totalHours)} h`;

  const hasBonuses =
    summary.bonusGross > 0;

  elements.bonusTotalRow.classList.toggle(
    "hidden",
    !hasBonuses
  );

  elements.bonusNetRow.classList.toggle(
    "hidden",
    !hasBonuses
  );

  elements.bonusLossRow.classList.toggle(
    "hidden",
    !hasBonuses
  );

  elements.bonusTotal.textContent =
    money(summary.bonusGross);

  elements.bonusNet.textContent =
    money(summary.bonusNet);

  elements.bonusLoss.textContent =
    loss(summary.bonusLoss);

  elements.bonusLossPercent.textContent =
    `${numberFormatter.format(
      bonusLossPercentage
    )}%`;

  elements.npdValue.textContent =
    money(summary.appliedNpd);

  elements.gpm.textContent =
    loss(summary.gpm);

  elements.sodra.textContent =
    loss(summary.sodra);

  elements.secondPillar.textContent =
    loss(summary.secondPillar);

  elements.secondPillarRow.classList.toggle(
    "hidden",
    !state.pension
  );

  elements.totalTax.textContent =
    loss(summary.totalTax);

  elements.netBottom.textContent =
    money(summary.net);
}

function renderMode() {
  for (const tab of elements.modeTabs) {
    tab.classList.toggle(
      "active",
      tab.dataset.mode === state.mode
    );
  }

  elements.salaryMode.classList.toggle(
    "hidden",
    state.mode !== "salary"
  );

  elements.hourlyMode.classList.toggle(
    "hidden",
    state.mode !== "hourly"
  );

  const yearIsVisible =
    state.mode === "hourly" &&
    state.view === "year";

  elements.monthView.classList.toggle(
    "hidden",
    yearIsVisible
  );

  elements.yearView.classList.toggle(
    "hidden",
    !yearIsVisible
  );

  elements.bonusSection.classList.toggle(
    "hidden",
    yearIsVisible
  );

  elements.previousMonth.disabled =
    yearIsVisible ||
    state.currentMonth === 0;

  elements.nextMonth.disabled =
    yearIsVisible ||
    state.currentMonth === 11;

  elements.monthTitle.textContent =
    yearIsVisible
      ? String(TAX_YEAR)
      : (
          `${MONTHS[state.currentMonth]}` +
          ` ${TAX_YEAR}`
        );

  elements.yearViewButton.textContent =
    yearIsVisible
      ? "Mėnuo"
      : "Metai";
}

function renderAll() {
  renderMode();
  renderBonuses();

  if (
    state.mode === "hourly" &&
    state.view === "year"
  ) {
    renderYearTable();
  } else if (state.mode === "hourly") {
    renderCalendar();
  }

  renderResults();
}

elements.salary.value =
  state.salary;

elements.hourlyRate.value =
  state.hourlyRate;

elements.useNpd.checked =
  state.useNpd;

elements.pension.checked =
  state.pension;

for (const tab of elements.modeTabs) {
  tab.addEventListener("click", () => {
    state.mode = tab.dataset.mode;

    if (state.mode === "salary") {
      state.view = "month";
    }

    selectedDates.clear();
    lastSelectedDate = null;

    saveState();
    renderAll();
  });
}

elements.salary.addEventListener(
  "input",
  () => {
    state.salary =
      parsePositiveNumber(
        elements.salary.value
      );

    saveState();
    renderResults();
  }
);

elements.hourlyRate.addEventListener(
  "input",
  () => {
    state.hourlyRate =
      parsePositiveNumber(
        elements.hourlyRate.value
      );

    saveState();

    renderCalendar();
    renderResults();

    if (state.view === "year") {
      renderYearTable();
    }
  }
);

elements.useNpd.addEventListener(
  "change",
  () => {
    state.useNpd =
      elements.useNpd.checked;

    saveState();

    renderResults();

    if (
      state.mode === "hourly" &&
      state.view === "year"
    ) {
      renderYearTable();
    }
  }
);

elements.pension.addEventListener(
  "change",
  () => {
    state.pension =
      elements.pension.checked;

    saveState();

    renderResults();

    if (
      state.mode === "hourly" &&
      state.view === "year"
    ) {
      renderYearTable();
    }
  }
);

elements.previousMonth.addEventListener(
  "click",
  () => {
    if (state.currentMonth <= 0) {
      return;
    }

    state.currentMonth -= 1;

    selectedDates.clear();
    lastSelectedDate = null;

    saveState();
    renderAll();
  }
);

elements.nextMonth.addEventListener(
  "click",
  () => {
    if (state.currentMonth >= 11) {
      return;
    }

    state.currentMonth += 1;

    selectedDates.clear();
    lastSelectedDate = null;

    saveState();
    renderAll();
  }
);

function toggleYearView() {
  if (state.mode !== "hourly") {
    return;
  }

  state.view =
    state.view === "year"
      ? "month"
      : "year";

  selectedDates.clear();
  lastSelectedDate = null;

  saveState();
  renderAll();
}

elements.yearViewButton.addEventListener(
  "click",
  toggleYearView
);

elements.monthTitle.addEventListener(
  "click",
  toggleYearView
);

elements.addBonus.addEventListener(
  "click",
  addBonus
);

elements.selectWeekdays.addEventListener(
  "click",
  selectWeekdays
);

elements.selectAllDays.addEventListener(
  "click",
  selectAllDays
);

elements.selectWorkedDays.addEventListener(
  "click",
  selectWorkedDays
);

elements.clearSelection.addEventListener(
  "click",
  clearSelection
);

for (
  const preset
  of document.querySelectorAll(
    ".shift-preset"
  )
) {
  preset.addEventListener("click", () => {
    applyShiftToSelected(
      preset.dataset.day,
      preset.dataset.night
    );
  });
}

elements.applyCustomShift.addEventListener(
  "click",
  () => {
    applyShiftToSelected(
      elements.bulkDayHours.value,
      elements.bulkNightHours.value
    );
  }
);

renderAll();