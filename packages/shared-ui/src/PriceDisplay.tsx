import React from 'react';
import { formatPrice } from '@3d-print/utils';

type PriceDisplayProps = {
  price: number;
  originalPrice?: number;
};

export const PriceDisplay: React.FC<PriceDisplayProps> = ({ price, originalPrice }) => {
  return (
    <span>
      <span style={{ color: '#ff4d4f', fontWeight: 600, fontSize: 18 }}>
        {formatPrice(price)}
      </span>
      {originalPrice && originalPrice > price && (
        <span
          style={{
            color: '#999',
            textDecoration: 'line-through',
            marginLeft: 8,
            fontSize: 14,
          }}
        >
          {formatPrice(originalPrice)}
        </span>
      )}
    </span>
  );
};
