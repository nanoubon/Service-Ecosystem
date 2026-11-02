import { useEnergy } from '../api';
import { Chart, LineChart, axisStyle, token } from '../components/Chart';
import { Card, PageHeader, QueryState } from '../components/ui';

export default function Energy() {
  const q = useEnergy();
  return (
    <>
      <PageHeader title="Energy" subtitle="โหลดและประสิทธิภาพของ Plant (EaaS · Advisory)" />
      <QueryState q={q}>{(e) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Plant load วันนี้" subtitle="RT รายชั่วโมง">
            <LineChart labels={e.hourly_load_rt.map((_, i) => `${String(i + 6).padStart(2, '0')}:00`)} series={[{ name: 'RT', data: e.hourly_load_rt, color: 'color-accent' }]} />
          </Card>
          <Card title="kW/RT ราย Chiller" subtitle="เกณฑ์เฝ้าระวัง > 0.70">
            <Chart option={{
              xAxis: { type: 'value', ...axisStyle() },
              yAxis: { type: 'category', data: e.kw_per_rt_by_chiller.map((c) => c.name), ...axisStyle() },
              series: [{ type: 'bar', data: e.kw_per_rt_by_chiller.map((c) => ({ value: c.kw_per_rt, itemStyle: { color: token(c.kw_per_rt > 0.7 ? 'color-warn' : 'color-primary') } })), label: { show: true, position: 'right', color: token('color-text') } }],
            }} />
          </Card>
        </div>
      )}</QueryState>
    </>
  );
}
