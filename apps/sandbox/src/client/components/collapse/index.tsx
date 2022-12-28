import React, { useCallback, useEffect, useState } from 'react';
import { ArrowSvg } from '../../public/arrow';
import { Loader } from '../loader';
import styles from './collapse.module.css';
import classnames from 'classnames';

export function Collapse({ name, children, isLoading = false, className = null, isOpen = false }) {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setOpened(isOpen);
  }, [isOpen]);

  const handleCollapseClick = useCallback((event) => {
    event.preventDefault();
    setOpened((prevState) => !prevState);
  }, []);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <summary className={styles.header}>
          <span className={styles.headerTitle}>{name}</span>
          <Loader />
        </summary>
      </div>
    );
  }

  return (
    <details className={classnames(className, styles.container)} open={opened}>
      <summary className={styles.header} onClick={handleCollapseClick}>
        <span className={styles.headerTitle}>{name}</span>{' '}
        <ArrowSvg className={opened ? styles.arrowOpened : ''} />
      </summary>

      {children}
    </details>
  );
}
