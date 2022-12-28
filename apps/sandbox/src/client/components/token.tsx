import React from "react";

export function Token({ token }) {
  return (
    <li className="bg-slate-300 p-4 rounded-lg">
      <p>
        {token.displayName} - ${Math.round(token.price * 100) / 100}
      </p>
      <p className="text-slate-500">{token.address}</p>

      {token.yield?.apr && (
        <p className="text-slate-500">
          Trading Fees APR:{" "}
          <span className="text-slate-800">
            {Math.round(token.yield.apr * 10000) / 100}%
          </span>
        </p>
      )}
    </li>
  );
}
