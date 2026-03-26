/* global Chart */
import { state } from "./state.js";

const chartCommon = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: { color: "#505868", font: { family: "IBM Plex Mono", size: 10 } },
    },
    y: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: { color: "#505868", font: { family: "IBM Plex Mono", size: 10 } },
    },
  },
};

const lineGrad = (ctx, chart, c) => {
  if (!chart?.chartArea) return c;
  const g = ctx.createLinearGradient(
    0,
    chart.chartArea.top,
    0,
    chart.chartArea.bottom,
  );
  g.addColorStop(0, c);
  g.addColorStop(1, c.replace("0.3", "0"));
  return g;
};

function createLineChart(
  ctx,
  { label, borderColor, bgColor, tooltipUnit, stepSize },
) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label,
          data: [],
          borderColor,
          backgroundColor:
            typeof bgColor === "function"
              ? bgColor
              : (c) => lineGrad(c.chart.ctx, c.chart, bgColor),
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
        },
      ],
    },
    options: {
      ...chartCommon,
      interaction: { mode: "index", intersect: false },
      scales: {
        ...chartCommon.scales,
        y: {
          ...chartCommon.scales.y,
          min: 0,
          suggestedMax: 10,
          ...(stepSize && {
            ticks: { ...chartCommon.scales.y.ticks, stepSize },
          }),
        },
      },
      plugins: {
        ...chartCommon.plugins,
        tooltip: {
          callbacks: { label: (ctx) => `${ctx.parsed.y} ${tooltipUnit}` },
        },
      },
    },
  });
}

export function initCharts() {
  const ctxActivity = document
    .getElementById("overviewActivityChart")
    ?.getContext("2d");
  if (ctxActivity) {
    state.overviewActivityChart = createLineChart(ctxActivity, {
      label: "Requests",
      borderColor: "#4f8fcf",
      bgColor: "rgba(79, 143, 207, 0.3)",
      tooltipUnit: "requests",
    });
  }

  const ctxProblems = document
    .getElementById("overviewProblemsChart")
    ?.getContext("2d");
  if (ctxProblems) {
    const problemsBg = (c) => {
      const g = c.chart.ctx.createLinearGradient(
        0,
        c.chart.chartArea?.bottom || 0,
        0,
        c.chart.chartArea?.top || 0,
      );
      g.addColorStop(0, "rgba(91, 155, 216, 0.4)");
      g.addColorStop(1, "rgba(248, 113, 113, 0.4)");
      return g;
    };
    state.overviewProblemsChart = createLineChart(ctxProblems, {
      label: "Errors",
      borderColor: "#f87171",
      bgColor: problemsBg,
      tooltipUnit: "errors",
      stepSize: 1,
    });
    state.overviewProblemsChart.data.datasets[0].spanGaps = true;
  }

  const ctxRoutes = document
    .getElementById("overviewRoutesChart")
    ?.getContext("2d");
  if (ctxRoutes) {
    const routesScaleY = {
      grid: { display: false },
      ticks: {
        color: "#505868",
        font: { family: "IBM Plex Mono", size: 11 },
        maxRotation: 0,
        maxWidth: 250,
        autoSkip: false,
        align: "start",
      },
      afterFit: (s) => {
        const m = s.chart.width / 3;
        if (s.width > m) s.width = m;
      },
    };
    state.overviewRoutesChart = new Chart(ctxRoutes, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Requests",
            data: [],
            backgroundColor: "rgba(79, 143, 207, 0.5)",
            borderColor: "#4f8fcf",
            borderWidth: 1,
            borderRadius: 4,
            barThickness: "flex",
            maxBarThickness: 24,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => `${ctx.parsed.x} requests` },
          },
        },
        scales: {
          x: {
            min: 0,
            suggestedMax: 10,
            grid: { color: "rgba(255,255,255,0.04)" },
            ticks: {
              color: "#505868",
              font: { family: "IBM Plex Mono", size: 10 },
              align: "start",
            },
          },
          y: routesScaleY,
        },
      },
    });
  }

  const ctxStatusCodes = document
    .getElementById("trafficStatusCodesChart")
    ?.getContext("2d");
  if (ctxStatusCodes) {
    state.trafficStatusCodesChart = new Chart(ctxStatusCodes, {
      type: "pie",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderColor: "var(--surface)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              color: "#505868",
              font: { family: "IBM Plex Mono", size: 11 },
              padding: 8,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct =
                  total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                return `${ctx.label}: ${ctx.raw} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }

  const ctxTraffic = document
    .getElementById("trafficVolumeChart")
    ?.getContext("2d");
  if (ctxTraffic) {
    state.trafficVolumeChart = createLineChart(ctxTraffic, {
      label: "Requests",
      borderColor: "#4f8fcf",
      bgColor: "rgba(79, 143, 207, 0.3)",
      tooltipUnit: "requests",
    });
  }
}
