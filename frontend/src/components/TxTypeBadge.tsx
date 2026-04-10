import React from 'react';
import { getTxTypeDisplay } from '../utils/transactionType';

interface Props {
  type:      string | null | undefined;
  showFull?: boolean;  // true → hiển thị labelFull; false (mặc định) → label ngắn
}

export const TxTypeBadge: React.FC<Props> = ({ type, showFull = false }) => {
  const d = getTxTypeDisplay(type);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.3px',
        backgroundColor: d.bgColor,
        color: d.color,
        whiteSpace: 'nowrap',
      }}
      title={d.labelVi}
    >
      {showFull ? d.labelFull : d.label}
    </span>
  );
};
