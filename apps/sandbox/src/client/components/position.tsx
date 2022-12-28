import React from 'react';

export function Position({ position }) {
  return (
    <li className="bg-slate-300 p-4 rounded-lg">
      <p>{position.id}</p>

      {position.supplied?.map(({ token, balance, isCollateral }) => (
        <div className="bg-slate-300 py-4 rounded-lg" key={`supplied_${token.address}`}>
          <p className="underline text-slate-500">Deposit</p>
          <p>
            {Math.round(balance * 10000) / 10000} {token.displayName}
          </p>
          <p>${Math.round(balance * token.price * 100) / 100}</p>
          {isCollateral != null && <p>Collateral: {isCollateral ? 'true' : 'false'}</p>}
          <p className="text-slate-500">{token.address}</p>
        </div>
      ))}

      {position.borrowed?.map(({ token, balance }) => (
        <div className="bg-slate-300 py-4 rounded-lg" key={`borrowed_${token.address}`}>
          <p className="underline text-slate-500">Borrow</p>
          <p>
            {Math.round(balance * 10000) / 10000} {token.displayName}
          </p>
          <p>${Math.round(balance * token.price * 100) / 100}</p>
          <p className="text-slate-500">{token.address}</p>
        </div>
      ))}

      {position.rewarded?.map(({ token, balance }) => (
        <div className="bg-slate-300 py-4 rounded-lg" key={`rewarded_${token.address}`}>
          <p className="underline text-slate-500">Reward</p>
          <p>
            {Math.round(balance * 10000) / 10000} {token.displayName}
          </p>
          <p>${Math.round(balance * token.price * 100) / 100}</p>
          <p className="text-slate-500">{token.address}</p>
        </div>
      ))}
    </li>
  );
}
