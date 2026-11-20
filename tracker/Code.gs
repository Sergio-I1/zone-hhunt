/**
 * Zone Hunt tracker
 * Counts website visits and games started, with a count for each game mode.
 *
 * Paste this whole file into a Google Sheet: Extensions -> Apps Script.
 * TRACKER-SETUP.md in the repo has the steps.
 */

const MODES = ["Classic", "Infection", "Manhunt", "Last Zone Standing", "Freeze Tag", "Sardines"];
const PLACES = ["Browser", "Home screen app", "iPhone app", "Android app"];

// The website sends one small message here for each visit and each game started.
function doPost(e) {
  let d = {};
  try { d = JSON.parse(e.postData.contents); } catch (err) { return reply_("bad request"); }
  const type = d.type === "visit" || d.type === "start" ? d.type : null;
  if (!type) return reply_("ignored");

  const mode = type === "start" ? (MODES.indexOf(d.mode) >= 0 ? d.mode : "Other") : "";
  const players = type === "start" ? Math.max(0, Math.min(99, Math.round(Number(d.players) || 0))) : "";
  const visitor = /^[a-z0-9]{6,16}$/.test(String(d.visitor || "")) ? String(d.visitor) : "unknown";
  const place = PLACES.indexOf(d.place) >= 0 ? d.place : "Browser";
  const device = d.device === "computer" ? "computer" : "phone";

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    ensure_();
    sheet_("Events").appendRow([new Date(), type, mode, players, visitor, place, device, d.test ? "yes" : ""]);
  } finally {
    lock.releaseLock();
  }
  return reply_("ok");
}

// Opening the web app link in a browser shows this, so you can check it is running.
function doGet() {
  return reply_("Zone Hunt tracker is running.");
}

// Run this once from the editor (select "setup" at the top, press Run).
// It builds the Events and Dashboard tabs and the chart, and asks for permission.
function setup() {
  ensure_();
  const dash = sheet_("Dashboard");
  if (dash.getCharts().length === 0) {
    const chart = dash.newChart()
      .setChartType(Charts.ChartType.BAR)
      .addRange(dash.getRange(13, 1, MODES.length + 2, 2))
      .setNumHeaders(1)
      .setOption("title", "Games started by mode")
      .setOption("legend", { position: "none" })
      .setOption("colors", ["#7B3FD0"])
      .setPosition(2, 10, 0, 0)
      .build();
    dash.insertChart(chart);
  }
  SpreadsheetApp.getActive().setActiveSheet(dash);
}

function ensure_() {
  const ss = SpreadsheetApp.getActive();
  if (!ss.getSheetByName("Events")) {
    const ev = ss.insertSheet("Events");
    ev.getRange(1, 1, 1, 8).setValues([["Time", "Type", "Mode", "Players", "Visitor", "Where", "Device", "Test game"]]).setFontWeight("bold");
    ev.setFrozenRows(1);
    ev.getRange("A:A").setNumberFormat("mmm d, yyyy h:mm am/pm");
    ev.setColumnWidth(1, 170);
  }
  if (!ss.getSheetByName("Dashboard")) buildDashboard_(ss.insertSheet("Dashboard", 0));
  const blank = ss.getSheetByName("Sheet1");
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 2) ss.deleteSheet(blank);
}

function buildDashboard_(sh) {
  const notTest = 'Events!H:H,"<>yes"';
  sh.getRange("A1").setValue("Zone Hunt").setFontSize(20).setFontWeight("bold");
  sh.getRange("A2").setValue("Updates by itself. Games started in Test mode are not counted.").setFontColor("#5D6A62");

  const totals = [
    ["Website visits", '=COUNTIFS(Events!B:B,"visit")'],
    ["Different devices", '=IFERROR(COUNTUNIQUE(FILTER(Events!E2:E,Events!B2:B="visit")),0)'],
    ["Games started", '=COUNTIFS(Events!B:B,"start",' + notTest + ')'],
    ["Visits, last 7 days", '=COUNTIFS(Events!B:B,"visit",Events!A:A,">="&(TODAY()-6))'],
    ["Games, last 7 days", '=COUNTIFS(Events!B:B,"start",Events!A:A,">="&(TODAY()-6),' + notTest + ')'],
    ["Most played mode", '=IF(B6=0,"None yet",INDEX(SORT(A14:B' + (13 + MODES.length + 1) + ',2,FALSE),1,1))'],
  ];
  sh.getRange(4, 1, totals.length, 2).setValues(totals);
  sh.getRange(4, 1, totals.length, 1).setFontWeight("bold");
  sh.getRange(4, 2, totals.length, 1).setFontSize(14).setHorizontalAlignment("left");

  // One row per game mode
  sh.getRange("A12").setValue("Each game mode").setFontWeight("bold").setFontSize(13);
  sh.getRange(13, 1, 1, 4).setValues([["Mode", "Games", "Avg players", "Last played"]]).setFontWeight("bold").setBackground("#EDE4FA");
  const rows = MODES.concat(["Other"]).map((m, i) => {
    const r = 14 + i, crit = 'Events!B:B,"start",Events!C:C,A' + r + "," + notTest;
    return [m, "=COUNTIFS(" + crit + ")", '=IFERROR(ROUND(AVERAGEIFS(Events!D:D,' + crit + '),1),"–")', '=IF(B' + r + '=0,"–",MAXIFS(Events!A:A,' + crit + '))'];
  });
  sh.getRange(14, 1, rows.length, 4).setValues(rows);
  sh.getRange(14, 4, rows.length, 1).setNumberFormat("mmm d, h:mm am/pm");

  // Last 14 days
  sh.getRange("F12").setValue("Last 14 days").setFontWeight("bold").setFontSize(13);
  sh.getRange(13, 6, 1, 3).setValues([["Day", "Visits", "Games"]]).setFontWeight("bold").setBackground("#EDE4FA");
  sh.getRange("F14").setFormula("=ARRAYFORMULA(TODAY()-SEQUENCE(14,1,0))");
  sh.getRange("G14").setFormula('=ARRAYFORMULA(COUNTIFS(Events!B:B,"visit",Events!A:A,">="&F14:F27,Events!A:A,"<"&(F14:F27+1)))');
  sh.getRange("H14").setFormula('=ARRAYFORMULA(COUNTIFS(Events!B:B,"start",Events!A:A,">="&F14:F27,Events!A:A,"<"&(F14:F27+1),' + notTest + '))');
  sh.getRange("F14:F27").setNumberFormat("ddd, mmm d");

  sh.setColumnWidth(1, 170); sh.setColumnWidth(4, 140); sh.setColumnWidth(5, 30); sh.setColumnWidth(6, 120);
}

function sheet_(name) { return SpreadsheetApp.getActive().getSheetByName(name); }
function reply_(text) { return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT); }
