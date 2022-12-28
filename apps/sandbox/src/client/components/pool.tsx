import React from 'react';

export function Pool({ pool }) {
  return (
    <li className="bg-slate-300 p-4 rounded-lg">
      <p>{pool.id}</p>
      {pool.supplied?.map(({ token, apr }) => (
        <div className="bg-slate-300 py-4 rounded-lg" key={`supplied_${token.address}`}>
          <p className="underline text-slate-500">Deposit</p>
          <p>{token.displayName}</p>
          <p className="text-slate-500">{token.address}</p>
          <p>APR: {apr?.year ? (apr.year * 100).toFixed(2) : 0}%</p>
        </div>
      ))}

      {pool.borrowed?.map(({ token, apr }) => (
        <div className="bg-slate-300 py-4 rounded-lg" key={`supplied_${token.address}`}>
          <p className="underline text-slate-500">Borrow</p>
          <p>{token.displayName}</p>
          <p className="text-slate-500">{token.address}</p>
          <p>APR: {apr?.year ? (apr.year * 100).toFixed(2) : 0}%</p>
        </div>
      ))}

      {pool.rewarded?.map(({ token, apr }) => (
        <div className="bg-slate-300 py-4 rounded-lg" key={`rewarded_${token.address}`}>
          <p className="underline text-slate-500">Reward</p>
          <p>{token.displayName}</p>
          <p className="text-slate-500">{token.address}</p>
          <p>APR: {apr?.year ? (apr.year * 100).toFixed(2) : 0}%</p>
        </div>
      ))}
    </li>
  );
}
