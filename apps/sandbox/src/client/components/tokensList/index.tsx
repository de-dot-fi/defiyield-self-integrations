import React, { useState, useEffect, ReactElement } from 'react';
import { Token as IToken } from '../../../types/module';
import { Collapse } from '../collapse';
import { Table } from 'antd';
import styles from './tokens.list.module.css';
import { NotFoundAssetSvg } from '../../public/not-found-asset';

interface IDataSource extends Omit<IToken, 'price' | 'icon'> {
  key: number;

  price?: any;
  icon?: any;
}

export function TokenList({ onTokensLoaded }) {
  const [isLoading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<IDataSource[]>([]);

  const columns = [
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
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
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
      title: 'Decimals',
      dataIndex: 'decimals',
      key: 'decimals',
    },
    {
      title: 'Chain id',
      dataIndex: 'chainId',
      key: 'chainId',
    },
  ];

  useEffect(() => {
    setLoading(true);
    fetch('/api/tokens')
      .then((res) => res.json())
      .then((data) => {
        setDataSource(
          data.tokens?.map(
            (token: IToken, key: number): IDataSource => ({
              ...token,
              key,
              price: token?.price ? (
                `$ ${token?.price}`
              ) : (
                <span className={styles.warningMessage}>No Price</span>
              ),
              icon: token?.icon ? (
                <img src={token.icon} className={styles.tokenLogo} />
              ) : (
                <NotFoundAssetSvg />
              ),
            }),
          ),
        );
        setLoading(false);
        onTokensLoaded();
      });
  }, []);

  return (
    <Collapse name={`Tokens - ${dataSource.length}`} isLoading={isLoading}>
      <Table columns={columns} dataSource={dataSource} />
    </Collapse>
  );
}
