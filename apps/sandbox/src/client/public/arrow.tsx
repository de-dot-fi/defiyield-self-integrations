import { ReactElement } from 'react';

export const ArrowSvg = ({ className }): ReactElement => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 16 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.5082 8.85005C15.9165 8.44172 15.9165 7.78338 15.5082 7.37505L8.5832 0.450048C8.2582 0.125049 7.7332 0.125048 7.40821 0.450048L0.483206 7.37505C0.0748726 7.78338 0.0748726 8.44171 0.483206 8.85005C0.891539 9.25838 1.54987 9.25838 1.9582 8.85005L7.99987 2.81671L14.0415 8.85838C14.4415 9.25838 15.1082 9.25838 15.5082 8.85005Z"
      fill="#657795"
    />
  </svg>
);
