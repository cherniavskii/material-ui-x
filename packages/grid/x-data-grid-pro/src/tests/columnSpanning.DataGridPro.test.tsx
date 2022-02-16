import * as React from 'react';
import { createRenderer } from '@mui/monorepo/test/utils';
import { expect } from 'chai';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { getCell } from 'test/utils/helperFn';

describe('<DataGridPro /> - Column Spanning', () => {
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

  it('should not apply `colSpan` in pinned columns section if there is only one column there', async () => {
    render(
      <div style={{ width: 500, height: 300 }}>
        <DataGridPro
          {...baselineProps}
          columns={[
            { field: 'brand', colSpan: 2, width: 110 },
            { field: 'category' },
            { field: 'price' },
          ]}
          initialState={{ pinnedColumns: { left: ['brand'], right: [] } }}
        />
      </div>,
    );

    expect(getCell(0, 0).offsetWidth).to.equal(110);
    expect(() => getCell(0, 0)).to.not.throw();
    expect(() => getCell(0, 1)).to.not.throw();
    expect(() => getCell(0, 2)).to.not.throw();
  });

  it('should apply `colSpan` inside pinned columns section', async () => {
    render(
      <div style={{ width: 500, height: 300 }}>
        <DataGridPro
          {...baselineProps}
          columns={[{ field: 'brand', colSpan: 2 }, { field: 'category' }, { field: 'price' }]}
          initialState={{ pinnedColumns: { left: ['brand', 'category'], right: [] } }}
        />
      </div>,
    );

    expect(() => getCell(0, 0)).to.not.throw();
    expect(() => getCell(0, 1)).to.throw(/not found/);
    expect(() => getCell(0, 2)).to.not.throw();
  });
});
