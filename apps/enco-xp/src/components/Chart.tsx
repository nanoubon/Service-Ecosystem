import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

/** Resolve a design token at runtime so charts never hardcode colors */
export const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();

export function Chart({ option, height = 240 }: { option: EChartsOption; height?: number }) {
  const base: EChartsOption = {
    backgroundColor: 'transparent',
    textStyle: { color: token('color-text-muted'), fontFamily: token('font-sans') },
    grid: { left: 40, right: 16, top: 24, bottom: 28 },
    tooltip: { trigger: 'axis', backgroundColor: token('color-panel-2'), borderColor: token('color-border'), textStyle: { color: token('color-text') } },
  };
  return <ReactECharts option={{ ...base, ...option }} style={{ height }} notMerge />;
}

export const axisStyle = () => ({
  axisLine: { lineStyle: { color: token('color-border') } },
  splitLine: { lineStyle: { color: token('color-divider') } },
});

export function LineChart({ labels, series, threshold, height }: { labels: string[]; series: { name: string; data: (number | null)[]; color: string; dashed?: boolean }[]; threshold?: number; height?: number }) {
  return (
    <Chart height={height} option={{
      xAxis: { type: 'category', data: labels, ...axisStyle() },
      yAxis: { type: 'value', scale: true, ...axisStyle() },
      legend: series.length > 1 ? { textStyle: { color: token('color-text-muted') }, top: 0, right: 0 } : undefined,
      series: series.map((s, i) => ({
        name: s.name, type: 'line', data: s.data, showSymbol: false, smooth: true,
        lineStyle: { color: token(s.color), type: s.dashed ? 'dashed' : 'solid', width: 2 }, itemStyle: { color: token(s.color) },
        areaStyle: s.dashed ? undefined : { color: token(s.color), opacity: 0.12 },
        markLine: i === 0 && threshold != null ? { symbol: 'none', data: [{ yAxis: threshold }], lineStyle: { color: token('color-warn'), type: 'dashed' }, label: { color: token('color-warn'), formatter: 'target' } } : undefined,
      })),
    }} />
  );
}
