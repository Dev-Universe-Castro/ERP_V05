import React from 'react';
import { cn } from '@/lib/utils';
import {
	Bar,
	BarChart as BarChartPrimitive,
	CartesianGrid,
	Cell,
	Label,
	LabelList,
	Legend as LegendPrimitive,
	Line,
	LineChart as LineChartPrimitive,
	Pie,
	PieChart as PieChartPrimitive,
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	RadialBar,
	RadialBarChart as RadialBarChartPrimitive,
	Rectangle,
	ResponsiveContainer,
	Scatter,
	ScatterChart as ScatterChartPrimitive,
	Tooltip as TooltipPrimitive,
	XAxis,
	YAxis,
} from 'recharts';

const ChartContainer = React.forwardRef(({ className, children, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			'flex aspect-video w-full flex-col items-stretch justify-center gap-1 [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-polar-grid_[stroke=hsl(var(--muted-foreground))]]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-reference-line_line]:stroke-border [&_.recharts-sector[stroke=hsl(var(--primary-foreground))]]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none',
			className,
		)}
		{...props}
	>
		<ResponsiveContainer>{children}</ResponsiveContainer>
	</div>
));
ChartContainer.displayName = 'ChartContainer';

const ChartTooltip = TooltipPrimitive;

const ChartTooltipContent = React.forwardRef(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			'rounded-lg border bg-background p-2 text-sm shadow-sm animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
			className,
		)}
		{...props}
	/>
));
ChartTooltipContent.displayName = 'ChartTooltipContent';

const ChartLegend = LegendPrimitive;

const ChartLegendContent = React.forwardRef(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			'flex items-center !justify-center !p-1 [&_.recharts-legend-item]:!ml-0 [&_.recharts-legend-item]:!mr-4',
			className,
		)}
		{...props}
	/>
));
ChartLegendContent.displayName = 'ChartLegendContent';

const ChartStyle = React.createContext(null);

const Chart = ({
	data,
	className,
	children,
	...props
}) => {
	const id = React.useId();
	const style = React.useMemo(
		() => ({
			color: `hsl(var(--chart-1))`,
			opacity: 0.1,
		}),
		[],
	);

	return (
		<ChartStyle.Provider value={{ id, ...style }}>
			<div
				data-chart=""
				className={cn(
					"h-full w-full [&_.recharts-area-area]:stroke-[var(--color)] [&_.recharts-area-dot]:fill-[var(--color)] [&_.recharts-area-gradient_stop]:[stop-color:var(--color)] [&_.recharts-bar-rectangle]:!fill-[var(--color)] [&_.recharts-bar-rectangle]:!stroke-[var(--color)] [&_.recharts-cartesian-axis-tick-line]:stroke-border [&_.recharts-cartesian-axis-line]:stroke-border [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-dot[r='8']]:!stroke-[var(--color)] [&_.recharts-dot]:!fill-[var(--color)] [&_.recharts-line-curve]:stroke-[var(--color)] [&_.recharts-line-dot]:!fill-[var(--color)] [&_.recharts-pie-sector]:!fill-[var(--color)] [&_.recharts-pie-sector]:!stroke-[var(--color)] [&_.recharts-polar-angle-axis-tick-line]:stroke-border [&_.recharts-polar-grid-concentric-polygon]:stroke-border [&_.recharts-radial-bar-background-sector]:!fill-[var(--color)] [&_.recharts-radial-bar-sector]:!fill-[var(--color)] [&_.recharts-reference-line_line]:stroke-[var(--color)] [&_.recharts-tooltip-cursor]:stroke-border",
					className,
				)}
				{...props}
			>
				{children}
			</div>
		</ChartStyle.Provider>
	);
};

const BarChart = BarChartPrimitive;
const LineChart = LineChartPrimitive;
const PieChart = PieChartPrimitive;
const RadialBarChart = RadialBarChartPrimitive;
const ScatterChart = ScatterChartPrimitive;

export {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Chart,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartStyle,
	ChartTooltip,
	ChartTooltipContent,
	Label,
	LabelList,
	LegendPrimitive,
	Line,
	LineChart,
	Pie,
	PieChart,
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	RadialBar,
	RadialBarChart,
	Rectangle,
	ResponsiveContainer,
	Scatter,
	ScatterChart,
	TooltipPrimitive,
	XAxis,
	YAxis,
};
