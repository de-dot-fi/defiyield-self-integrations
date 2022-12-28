import { Table } from 'antd';
import { Token } from '../../../types/module';
import { NotFoundAssetSvg } from '../../public/not-found-asset';
import styles from './pool.info.module.css';

export const UnderlyingTable = ({ underlying }: { underlying: Token[] }) => {
  const suppliedColumns = [
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
  ];
  return (
    <Table
      showHeader={false}
      pagination={false}
      columns={suppliedColumns}
      dataSource={underlying?.map((token: Token, key: number): any => ({
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
      }))}
    />
  );
};
