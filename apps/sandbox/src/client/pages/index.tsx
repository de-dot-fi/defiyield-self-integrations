import React, { useEffect, useState } from 'react';
import { PoolList } from '../components/poolsList';
import { TokenList } from '../components/tokensList';
import { UserPositions } from '../components/userPositions';
import styles from './home.module.css';

export default function Home() {
  const [hasTokens, setHasTokens] = useState(false);
  const [hasPools, setHasPools] = useState(false);
  const [platform, setPlatform] = useState(null);

  useEffect(() => {
    fetch('/api/platform')
      .then((res) => res.json())
      .then((data) => {
        setPlatform(data.meta);
      });
  }, []);

  return (
    <main className="px-4 py-12 grid gap-8">
      <div className={styles.platformContainer}>
        <img src={platform?.links?.logo} className={styles.platformLogo} />

        <span className={styles.platformName}>{platform?.name}</span>
      </div>

      <TokenList onTokensLoaded={() => setHasTokens(true)} />
      {hasTokens && <PoolList onPoolsLoaded={() => setHasPools(true)} />}
      {hasTokens && hasPools && <UserPositions />}
    </main>
  );
}
