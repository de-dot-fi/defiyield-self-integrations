import { useCallback, useEffect, useState } from 'react';
import { UserBorrowed, UserPosition, UserRewarded, UserSupplied } from '../../../types/module';
import { NotFoundAssetSvg } from '../../public/not-found-asset';
import { Collapse } from '../collapse';
import styles from './position.info.module.css';
import { Table } from 'antd';
import { UnderlyingTable } from '../poolInfo/underlying.table';

export const PositionInfo = ({ position }: { position: UserPosition }) => {
  const [suppliedData, setSuppliedData] = useState([]);
  const [borrowedData, setBorrowedData] = useState([]);
  const [rewardedData, setRewardedData] = useState([]);

  useEffect(() => {
    setSuppliedData(
      position.supplied?.map((supply: UserSupplied, key: number): any => ({
        ...supply.token,
        key,
        apr: supply?.apr?.year && `${+supply?.apr.year * 100} %`,
        tvl: supply?.tvl && `$${supply?.tvl.toFixed(2)}`,
        balance: supply?.balance,
        value: `$${+supply?.balance * +supply.token?.price || 0}`,
        collateral: supply?.isCollateral && (
          <span className={styles.successMessage}>collateral</span>
        ),
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
      position.borrowed?.map((borrow: UserBorrowed, key: number): any => ({
        ...borrow.token,
        key,
        apr: borrow?.apr?.year && `${+borrow?.apr.year * 100} %`,
        tvl: borrow?.tvl && `$${borrow?.tvl.toFixed(2)}`,
        balance: borrow?.balance,
        value: +borrow?.balance * +borrow.token?.price || 0,
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
      position.rewarded?.map((reward: UserRewarded, key: number): any => ({
        ...reward.token,
        key,
        apr: reward?.apr?.year && `${+reward?.apr.year * 100} %`,
        tvl: reward?.tvl && `$${reward?.tvl.toFixed(2)}`,
        balance: reward?.balance,
        value: +reward?.balance * +reward.token?.price || 0,
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
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
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
    {
      title: 'Collateral',
      dataIndex: 'collateral',
      key: 'collateral',
    },
  ];

  const isExisting = useCallback((position: any) => Array.isArray(position) && position.length, []);

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
