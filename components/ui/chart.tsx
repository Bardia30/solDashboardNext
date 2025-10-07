"use client";

import * as React from "react";
import * as Recharts from "recharts";
import { cn } from "./utils";

// Light/dark theme selectors
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = { config: ChartConfig };
const ChartContext = React.createContext<ChartContextProps | null>(null);

export function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error("useChart must be used within <ChartContainer>");
  return ctx;
}

/* --- ✅ key fix: children must be a single ReactElement or a render fn --- */
type ResponsiveChild =
  | React.ReactElement
  | ((size: { width: number; height: number }) => React.ReactElement | null);

/* -------------------------------------------------------------------------- */
/*                            Chart Container Wrapper                         */
/* -------------------------------------------------------------------------- */
export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: ResponsiveChild; // <-- was React.ReactNode
}) {
  const chartId = React.useId().replace(/:/g, "");
  const resolvedId = `chart-${id || chartId}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={resolvedId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
          "[&_.recharts-surface]:outline-hidden",
          "flex aspect-video justify-center text-xs",
          className
        )}
        {...props}
      >
        <ChartStyle id={resolvedId} config={config} />
        {/* children is now correctly typed; pass it straight through */}
        <Recharts.ResponsiveContainer>
          {children as any}
        </Recharts.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Chart Style Injector                          */
/* -------------------------------------------------------------------------- */
function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const entries = Object.entries(config).filter(([, v]) => v.theme || v.color);
  if (!entries.length) return null;

  const css = Object.entries(THEMES)
    .map(
      ([theme, selector]) => `
${selector} [data-chart=${id}] {
${entries
  .map(([key, value]) => {
    const color =
      value.theme?.[theme as keyof typeof value.theme] ?? value.color;
    return color ? `  --color-${key}: ${color};` : "";
  })
  .join("\n")}
}`
    )
    .join("\n");

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

/* -------------------------------------------------------------------------- */
/*                                  Tooltip                                   */
/* -------------------------------------------------------------------------- */
export const ChartTooltip = Recharts.Tooltip;

export function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: {
  active?: boolean;
  payload?: any[];
  className?: string;
  indicator?: "line" | "dot" | "dashed";
  hideLabel?: boolean;
  hideIndicator?: boolean;
  label?: React.ReactNode;
  labelFormatter?: (label: React.ReactNode, payload?: any[]) => React.ReactNode;
  labelClassName?: string;
  formatter?: (...args: any[]) => React.ReactNode;
  color?: string;
  nameKey?: string;
  labelKey?: string;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;
  const [item] = payload;

  const key = labelKey || item?.dataKey || item?.name;
  const itemCfg = key ? (config as any)[key] : undefined;
  const displayLabel =
    !hideLabel &&
    (labelFormatter
      ? labelFormatter(itemCfg?.label ?? label, payload)
      : itemCfg?.label ?? label);

  return (
    <div
      className={cn(
        "border border-border/50 bg-background rounded-md px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {displayLabel && (
        <div className={cn("font-medium", labelClassName)}>{displayLabel}</div>
      )}
      <div className="mt-1 grid gap-1">
        {payload.map((p, i) => {
          const k = nameKey || p.name || p.dataKey;
          const cfg = k ? (config as any)[k] : undefined;
          const indicatorColor = color || p.color;
          return (
            <div key={i} className="flex items-center gap-2">
              {!hideIndicator && (
                <div
                  className={cn(
                    "shrink-0 rounded-[2px]",
                    indicator === "dot" && "h-2.5 w-2.5",
                    indicator === "line" && "w-1 h-3",
                    indicator === "dashed" &&
                      "w-0 border-[1.5px] border-dashed bg-transparent"
                  )}
                  style={{ backgroundColor: indicatorColor }}
                />
              )}
              <span className="flex-1 text-muted-foreground">
                {cfg?.label || p.name}
              </span>
              {p.value != null && (
                <span className="font-mono font-medium tabular-nums">
                  {Number(p.value).toLocaleString()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Legend                                    */
/* -------------------------------------------------------------------------- */
export const ChartLegend = Recharts.Legend;

export function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: {
  className?: string;
  hideIcon?: boolean;
  payload?: any[];
  verticalAlign?: "top" | "bottom";
  nameKey?: string;
}) {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item) => {
        const key = nameKey || item.dataKey;
        const cfg = key ? (config as any)[key] : undefined;
        return (
          <div
            key={item.value}
            className="flex items-center gap-1.5 text-muted-foreground text-xs"
          >
            {!hideIcon &&
              (cfg?.icon ? (
                <cfg.icon />
              ) : (
                <div
                  className="h-2 w-2 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
              ))}
            <span>{cfg?.label ?? item.value}</span>
          </div>
        );
      })}
    </div>
  );
}
