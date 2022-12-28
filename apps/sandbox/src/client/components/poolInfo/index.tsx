import { Pool as IPool, PoolBorrowed, PoolRewarded, PoolSupplied } from '../../../types/module';
import styles from './pool.info.module.css';
import { Table } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { NotFoundAssetSvg } from '../../public/not-found-asset';
import { UnderlyingTable } from './underlying.table';
import { Collapse } from '../collapse';

export const PoolInfo = ({ pool }: { pool: IPool }) => {
  const [suppliedData, setSuppliedData] = useState([]);
  const [borrowedData, setBorrowedData] = useState([]);
  const [rewardedData, setRewardedData] = useState([]);

  useEffect(() => {
    setSuppliedData(
      pool.supplied?.map((supply: PoolSupplied, key: number): any => ({
        ...supply.token,
        key,
        apr: supply?.apr?.year && `${+supply?.apr.year * 100} %`,
        tvl: supply?.tvl && `$${supply?.tvl.toFixed(2)}`,
        price: supply.token?.price ? (
          `$ ${supply.token?.price}`
        ) : (
          <span className={styles.warningMessage}>No Price</span>
        ),
        icon: supply.token?.icon ? (
          <img src={supply.token.icon} className={styles.tokenLogo} />
        ) : (
          <NotFoundAssetSvg />
        ),
      })),
    );

    setBorrowedData(
      pool.borrowed?.map((borrow: PoolBorrowed, key: number): any => ({
        ...borrow.token,
        key,
        apr: borrow?.apr?.year && `${+borrow?.apr.year * 100} %`,
        tvl: borrow?.tvl && `$${borrow?.tvl.toFixed(2)}`,
        price: borrow.token?.price ? (
          `$ ${borrow.token?.price}`
        ) : (
          <span className={styles.warningMessage}>No Price</span>
        ),
        icon: borrow.token?.icon ? (
          <img src={borrow.token.icon} className={styles.tokenLogo} />
        ) : (
          <NotFoundAssetSvg />
        ),
      })),
    );

    setRewardedData(
      pool.rewarded?.map((reward: PoolRewarded, key: number): any => ({
        ...reward.token,
        key,
        apr: reward?.apr?.year && `${+reward?.apr.year * 100} %`,
        tvl: reward?.tvl && `$${reward?.tvl.toFixed(2)}`,
        price: reward.token?.price ? (
          `$ ${reward.token?.price}`
        ) : (
          <span className={styles.warningMessage}>No Price</span>
        ),
        icon: reward.token?.icon ? (
          <img src={reward.token.icon} className={styles.tokenLogo} />
        ) : (
          <NotFoundAssetSvg />
        ),
      })),
    );
  }, []);

  const baseColumns = [
    {
      title: 'Icon',
      dataIndex: 'icon',
      key: 'icon',
    },
    {
      title: 'Display Name',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },

    {
      title: 'Chain Id',
      dataIndex: 'chainId',
      key: 'chainId',
    },
    {
      title: 'Decimals',
      dataIndex: 'decimals',
      key: 'decimals',
    },
    {
      title: 'TVL',
      dataIndex: 'tvl',
      key: 'tvl',
    },
    {
      title: 'APR',
      dataIndex: 'apr',
      key: 'apr',
    },
  ];

  const isExisting = useCallback((instance: any) => Array.isArray(instance) && instance.length, []);

  return (
    <>
      {isExisting(suppliedData) && (
        <Collapse name="Supplied" className={styles.panel}>
          <Table
            pagination={false}
            columns={baseColumns}
            dataSource={suppliedData}
            expandable={{
              expandedRowRender: (supply) => <UnderlyingTable underlying={supply.underlying} />,
            }}
          />
        </Collapse>
      )}

      {isExisting(borrowedData) && (
        <Collapse name="Borrowed" className={styles.panel}>
          <Table
            pagination={false}
            columns={baseColumns}
            dataSource={borrowedData}
            expandable={{
              expandedRowRender: (borrow) => <UnderlyingTable underlying={borrow.underlying} />,
            }}
          />
        </Collapse>
      )}

      {isExisting(rewardedData) && (
        <Collapse name="Rewarded" className={styles.panel}>
          <Table
            pagination={false}
            columns={baseColumns}
            dataSource={rewardedData}
            expandable={{
              expandedRowRender: (reward) => <UnderlyingTable underlying={reward.underlying} />,
            }}
          />
        </Collapse>
      )}
    </>
  );
};
