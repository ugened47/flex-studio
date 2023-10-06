import React from "react";

export default function TransitionArrow({ className }: { className?: string }) {
  return (
    <svg width="25" height="11" viewBox="0 0 25 11" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeDasharray="1,1"
        strokeLinecap="square"
        d="M15.4 5.5H0h15.4V1l8.8 4.5-8.8 4.4V5.5z"
      />
    </svg>
  );
}

export const CustomerArrow = () => <TransitionArrow className="text-[#F5A623]" />;

export const ProviderArrow = () => <TransitionArrow className="text-[#BD10E0]" />;

export const OperatorArrow = () => <TransitionArrow className="text-[#417505]" />;

export const AutomaticArrow = () => <TransitionArrow className="text-[#888888]" />;

export const AutomaticArrowTail = () => (
  <svg
    width="28"
    height="11"
    viewBox="0 0 28 11"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line
      fillRule="nonzero"
      stroke="#888888"
      fill="#888888"
      y1="5.5"
      strokeLinecap="square"
      strokeWidth="1"
      x1="0"
      y2="5.5"
      x2="28">
    </line>
  </svg>
);

export const AutomaticArrowHead = () => (
  <svg
    width="25"
    height="11"
    viewBox="0 0 25 11"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.4 5.5H0h15.4V1l8.8 4.5-8.8 4.4V5.5z"
      fill="#888888"
      fillRule="nonzero"
      stroke="#888888"
      strokeDasharray="1,1"
      strokeLinecap="square"
    />
  </svg>
);

export const PrivilegedStateIcon = () => (
  <svg width="12" height="15" viewBox="0 0 12 15" fill="currentColor" stroke="currentColor">
    <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 8.286v3.428C11 12.977 9.946 14 8.647 14H3.353C2.053 14 1 12.977 1 11.714V8.286C1 7.023 2.054 6 3.353 6h5.294C9.947 6 11 7.023 11 8.286zM8.273 10c0-1.23-1.018-2.222-2.273-2.222-1.256 0-2.273.993-2.273 2.222 0 1.228 1.017 2.222 2.273 2.222 1.255 0 2.273-.994 2.273-2.222z" />
      <path d="M3 6.494V4.046C3 2.363 4.343 1 6 1s3 1.363 3 3.046V8" strokeWidth="1.5" fill="none" />
    </g>
  </svg>
);