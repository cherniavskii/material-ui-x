import * as React from 'react';
import { createRenderer } from '@mui/monorepo/test/utils';
import { expect } from 'chai';
import { DataGrid } from '@mui/x-data-grid';
import { getCell } from 'test/utils/helperFn';

describe('<DataGrid /> - Column Spanning', () => {
  const { render } = createRenderer({ clock: 'fake' });

  const baselineProps = {
    rows: [
      {
        id: 0,
        brand: 'Nike',
        category: 'Shoes',
        price: '$120',
        rating: '4.5',
      },
      {
        id: 1,
        brand: 'Adidas',
        category: 'Shoes',
        price: '$100',
        rating: '4.5',
      },
      {
        id: 2,
        brand: 'Puma',
        category: 'Shoes',
        price: '$90',
        rating: '4.5',
      },
    ],
  };

  it('should support `colSpan` number signature', async () => {
    render(
      <div style={{ width: 500, height: 300 }}>
        <DataGrid
          {...baselineProps}
          columns={[
            { field: 'brand', colSpan: 3 },
            { field: 'category' },
            { field: 'price' },
            { field: 'rating' },
          ]}
        />
      </div>,
    );
    expect(() => getCell(0, 0)).to.not.throw();
    expect(() => getCell(0, 1)).to.throw(/not found/);
    expect(() => getCell(0, 2)).to.throw(/not found/);
    expect(() => getCell(0, 3)).to.not.throw();
  });

  it('should support `colSpan` function signature', async () => {
    render(
      <div style={{ width: 500, height: 300 }}>
        <DataGrid
          {...baselineProps}
          columns={[
            {
              field: 'brand',
              colSpan: ({ row }) => (row.brand === 'Nike' ? 2 : 1),
            },
            {
              field: 'category',
              colSpan: ({ row }) => (row.brand === 'Adidas' ? 2 : 1),
            },
            {
              field: 'price',
              colSpan: ({ row }) => (row.brand === 'Puma' ? 2 : 1),
            },
            { field: 'rating' },
          ]}
        />
      </div>,
    );
    // Nike
    expect(() => getCell(0, 0)).to.not.throw();
    expect(() => getCell(0, 1)).to.throw(/not found/);
    expect(() => getCell(0, 2)).to.not.throw();
    expect(() => getCell(0, 3)).to.not.throw();

    // Adidas
    expect(() => getCell(1, 0)).to.not.throw();
    expect(() => getCell(1, 1)).to.not.throw();
    expect(() => getCell(1, 2)).to.throw(/not found/);
    expect(() => getCell(1, 3)).to.not.throw();

    // Puma
    expect(() => getCell(2, 0)).to.not.throw();
    expect(() => getCell(2, 1)).to.not.throw();
    expect(() => getCell(2, 2)).to.not.throw();
    expect(() => getCell(2, 3)).to.throw(/not found/);
  });
});
