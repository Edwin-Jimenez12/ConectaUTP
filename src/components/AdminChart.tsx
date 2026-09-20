import { BarChart3, LineChart, PieChart } from 'lucide-react';

export type ChartType = 'bar' | 'line' | 'donut';

interface AdminChartProps {
  title: string;
  subtitle: string;
  type: ChartType;
  values: number[];
  labels: string[];
  suffix?: string;
  showAxis?: boolean;
}

const chartIcons = { bar: BarChart3, line: LineChart, donut: PieChart };

export function AdminChart({ title, subtitle, type, values, labels, suffix = '', showAxis = false }: AdminChartProps) {
  const Icon = chartIcons[type];
  const max = Math.max(...values, 1);
  const total = values.reduce((sum, value) => sum + value, 0);
  const chartLeft = showAxis ? 50 : 24;
  const chartRight = 576;
  const chartTop = 28;
  const chartBottom = 190;
  const chartHeight = chartBottom - chartTop;
  const pointX = (index: number) => chartLeft + (index * (chartRight - chartLeft)) / Math.max(values.length - 1, 1);
  const pointY = (value: number) => chartBottom - (value / max) * chartHeight;
  const axisValues = [max, Math.round(max * 0.66), Math.round(max * 0.33), 0];
  const donutColors = ['#7b32ca', '#315de5', '#a96be0', '#d9d2eb'];
  const donutGradient = total > 0
    ? values.reduce<string[]>((segments, value, index) => {
      const start = index === 0 ? 0 : Number(segments[index - 1].split(' ').at(-1)?.replace('%', '') ?? 0);
      const end = start + (value / total) * 100;
      segments.push(`${donutColors[index % donutColors.length]} ${start}% ${end}%`);
      return segments;
    }, []).join(', ')
    : '#d9d2eb 0 100%';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-xs text-[#676878]">{subtitle}</p></div>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0edff] text-[#7b32ca]"><Icon aria-hidden="true" className="h-4 w-4" /></span>
      </div>
      {type === 'donut' ? (
        <div className="mt-8 flex items-center gap-7">
          <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(${donutGradient})` }}>
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-center"><span><strong className="block text-xl">{total}</strong><small className="text-[10px] text-[#676878]">total</small></span></div>
          </div>
          <div className="space-y-3 text-xs">{labels.map((label, index) => <div className="flex items-center gap-2" key={label}><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: donutColors[index % donutColors.length] }} /><span className="text-[#676878]">{label}</span><strong className="ml-auto">{values[index]}{suffix}</strong></div>)}</div>
        </div>
      ) : type === 'line' ? (
        <div className="mx-auto mt-8 h-64 w-full max-w-[920px] rounded-lg border border-slate-100 bg-[#faf8ff] px-2 py-2">
          <svg className="h-full w-full" viewBox="0 0 600 250" preserveAspectRatio="none" role="img" aria-label={title}>
            {axisValues.map((value, index) => {
              const y = chartTop + (index * chartHeight) / (axisValues.length - 1);
              return <g key={value}><line x1={chartLeft} x2={chartRight} y1={y} y2={y} stroke="#e5e1f3" strokeWidth="1" />{showAxis && <text fill="#676878" fontSize="11" textAnchor="end" x="42" y={y + 4}>{value}{suffix}</text>}</g>;
            })}
            <polyline fill="none" points={values.map((value, index) => `${pointX(index)},${pointY(value)}`).join(' ')} stroke="#7b32ca" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
            {values.map((value, index) => <circle cx={pointX(index)} cy={pointY(value)} fill="#ffffff" key={`${labels[index]}-${value}`} r="6" stroke="#7b32ca" strokeWidth="3" />)}
            {labels.map((label, index) => <text fill="#676878" fontSize="11" textAnchor="middle" x={pointX(index)} y="222" key={label}>{label}</text>)}
          </svg>
        </div>
      ) : (
        <div className="mx-auto mt-8 flex h-56 w-full max-w-[920px] gap-2">
          {showAxis && <div className="flex w-8 shrink-0 flex-col justify-between pb-8 pt-2 text-[10px] text-[#676878]">{axisValues.map((value) => <span key={value}>{value}{suffix}</span>)}</div>}
          <div className="relative flex min-w-0 flex-1 items-end gap-3 border-b border-l border-slate-200 px-3 pb-0 pt-4">
            {showAxis && <div className="pointer-events-none absolute inset-x-0 bottom-8 top-2 flex flex-col justify-between">{axisValues.map((value) => <span className="border-t border-[#e5e1f3]" key={value} />)}</div>}
            {values.map((value, index) => <div className="relative z-10 flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2" key={`${labels[index]}-${value}`}><span className="text-[10px] font-semibold text-[#7b32ca]">{value}{suffix}</span><div className="w-full max-w-10 rounded-t-md bg-linear-to-t from-[#7b32ca] to-[#a96be0]" style={{ height: `${Math.max((value / max) * 100, 5)}%` }} /><small className="text-[10px] text-[#676878]">{labels[index]}</small></div>)}
          </div>
        </div>
      )}
    </article>
  );
}
