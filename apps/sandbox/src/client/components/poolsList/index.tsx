import { Tooltip } from 'antd';
import React, { useState, useEffect, useCallback } from 'react';
import { Pool as IPool, PoolSupplied } from '../../../types/module';
import { Collapse } from '../collapse';
import { PoolInfo } from '../poolInfo';
import styles from './pools.list.module.css';

export function PoolList({ onPoolsLoaded }) {
  const [isLoading, setLoading] = useState(false);
  const [pools, setPools] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetch('/api/pools')
      .then((res) => res.json())
      .then((data) => {
        console.log(data.pools);
        setPools(data.pools);
        setLoading(false);
        onPoolsLoaded();
      });
  }, []);

  const isSupplied = useCallback(
    (supplied: PoolSupplied[]) => Array.isArray(supplied) && supplied.length,
    [],
  );

  const PanelSuppliedTokens = ({ supplied }: { supplied: PoolSupplied[] }) =>
    isSupplied(supplied) && (
      <Tooltip title="Supplied Tokens" className={styles.panelExtraText}>
        {String(supplied.map((supply) => supply.token?.displayName)).replace(/,/, ' / ')}
      </Tooltip>
    );

  const PanelTvl = ({ supplied }: { supplied: PoolSupplied[] }) =>
    isSupplied(supplied) && (
      <Tooltip title="TVL" className={styles.panelExtraText}>
        ${supplied.reduce((prevTvl, supply) => prevTvl + (supply?.tvl || 0), 0).toFixed(0) || 0}
      </Tooltip>
    );

  const PanelTitle = ({ pool }: { pool: IPool }) => {
    return (
      <span className={styles.panelTitleWrapper}>
        <span>{pool.id}</span> <PanelSuppliedTokens supplied={pool?.supplied} />
        <PanelTvl supplied={pool?.supplied} />
      </span>
    );
  };

  return (
    <Collapse name={`Pools - ${pools.length}`} isLoading={isLoading}>
      {pools.map((pool: IPool, key) => {
        return (
          <Collapse name={<PanelTitle pool={pool} />} key={key} className={styles.panel}>
            <PoolInfo pool={pool} />
          </Collapse>
        );
      })}
    </Collapse>
  );
}
