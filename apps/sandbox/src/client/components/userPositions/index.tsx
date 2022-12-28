import React, { useCallback, useState } from 'react';
import { UserPosition } from '../../../types/module';
import { Collapse } from '../collapse';
import { Position } from '../position';
import { Button, Input } from 'antd';
import { PositionInfo } from '../positionInfo';
import styles from './user.positions.module.css';
import { Loader } from '../loader';

const placeholderWallet = '0xd874387ebb001a6b0bea98072f8de05f8965e51e';

export function UserPositions() {
  const [address, setAddress] = useState('');
  const [positions, setPositions] = useState([] as UserPosition[]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSubmit = (evt) => {
    evt.preventDefault();
    setIsLoading(true);
    fetch(`/api/users/${address}`)
      .then((res) => res.json())
      .then((data) => {
        setPositions(data.user);

        setIsLoading(false);
        setIsError(false);
        setIsDataLoaded(true);
      })
      .catch((error) => {
        console.error(error);

        setIsLoading(false);
        setIsError(true);
        setIsDataLoaded(false);
      });
  };

  const handleChange = useCallback((evt) => {
    evt.preventDefault();
    setAddress(evt.target.value);
  }, []);

  return (
    <Collapse name="User" isLoading={false}>
      <Input.Group compact className="ml-6">
        <Input
          className={styles.textInput}
          value={address}
          placeholder={placeholderWallet}
          onChange={handleChange}
        />
        <Button className={styles.submitButton} type="primary" onClick={handleSubmit}>
          Check
        </Button>

        {isLoading && <Loader />}
      </Input.Group>

      {isError && (
        <div className={styles.warningMessage}>
          Error during fetching positions. Check console and HTTP request
        </div>
      )}

      {!isError && !isLoading && isDataLoaded ? (
        positions.map((position) => (
          <Collapse name={position.id} key={position.id} isOpen={true}>
            <PositionInfo position={position} />
          </Collapse>
        ))
      ) : (
        <div className={styles.noDataMessage}>No positions loaded</div>
      )}
    </Collapse>
  );
}
