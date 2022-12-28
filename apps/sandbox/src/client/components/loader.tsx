import React from "react";

export function Loader() {
  return (
    <div className="scale-50 -m-4">
      <svg className="loader object-cover">
        <circle
          className="spinner"
          cx="40"
          cy="40"
          fill="none"
          r="36"
          stroke="red"
          strokeLinecap="round"
          strokeWidth="5"
        ></circle>
      </svg>
    </div>
  );
}
