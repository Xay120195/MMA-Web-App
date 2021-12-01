import React from "react";

const cleanPercentage = (percentage) => {
  const tooLow = !Number.isFinite(+percentage) || percentage < 0;
  const tooHigh = percentage > 100;
  return tooLow ? 0 : tooHigh ? 100 : +percentage;
};

const Circle = ({ colour, pct }) => {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const strokePct = ((100 - pct) * circ) / 100;
  return (
    <circle
      r={r}
      cx={175}
      cy={25}
      fill="transparent"
      stroke={strokePct !== circ ? colour : ""}
      strokeWidth={"5px"}
      strokeDasharray={circ}
      strokeDashoffset={pct ? strokePct : 0}
      strokeLinecap="round"
    ></circle>
  );
};

const Text = ({ percentage }) => {
  return (
    <text
      x="50%"
      y="50%"
      dominantBaseline="central"
      textAnchor="middle"
    >
      {percentage.toFixed(0)}%
    </text>
  );
};

const Pie = ({ percentage, colour }) => {
  const pct = cleanPercentage(percentage);
  return (
    <svg width={50} height={50}>
      <g transform={`rotate(-90 ${"100 100"})`}>
        <Circle colour="lightgrey" />
        <Circle colour={colour} pct={pct} />
      </g>
      <Text percentage={pct} />
    </svg>
  );
};

export default Pie;
