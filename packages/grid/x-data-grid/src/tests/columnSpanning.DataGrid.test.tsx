import * as React from 'react';
import { createRenderer, fireEvent, waitFor } from '@mui/monorepo/test/utils';
import { expect } from 'chai';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import { getCell, getActiveCell } from 'test/utils/helperFn';

function fireClickEvent(cell: HTMLElement) {
  fireEvent.mouseUp(cell);
  fireEvent.click(cell);
}

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

  /* eslint-disable material-ui/disallow-active-element-as-key-event-target */
  describe('key navigation', () => {
    const columns = [
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
    ];

    it('should move to the cell right when pressing "ArrowRight"', () => {
      render(
        <div style={{ width: 500, height: 300 }}>
          <DataGrid {...baselineProps} columns={columns} />
        </div>,
      );

      fireClickEvent(getCell(0, 0));
      expect(getActiveCell()).to.equal('0-0');

      fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
      expect(getActiveCell()).to.equal('0-2');
    });

    it('should move to the cell left when pressing "ArrowLeft"', () => {
      render(
        <div style={{ width: 500, height: 300 }}>
          <DataGrid {...baselineProps} columns={columns} />
        </div>,
      );

      fireClickEvent(getCell(0, 2));
      expect(getActiveCell()).to.equal('0-2');

      fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
      expect(getActiveCell()).to.equal('0-0');
    });

    it('should move to the cell above when pressing "ArrowUp"', () => {
      render(
        <div style={{ width: 500, height: 300 }}>
          <DataGrid {...baselineProps} columns={columns} />
        </div>,
      );

      fireClickEvent(getCell(1, 1));
      expect(getActiveCell()).to.equal('1-1');

      fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
      expect(getActiveCell()).to.equal('0-0');
    });

    it('should move to the cell below when pressing "ArrowDown"', () => {
      render(
        <div style={{ width: 500, height: 300 }}>
          <DataGrid {...baselineProps} columns={columns} />
        </div>,
      );

      fireClickEvent(getCell(1, 3));
      expect(getActiveCell()).to.equal('1-3');

      fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
      expect(getActiveCell()).to.equal('2-2');
    });

    it('should move down by the amount of rows visible on screen when pressing "PageDown"', () => {
      render(
        <div style={{ width: 500, height: 300 }}>
          <DataGrid {...baselineProps} columns={columns} />
        </div>,
      );

      fireClickEvent(getCell(0, 3));
      expect(getActiveCell()).to.equal('0-3');

      fireEvent.keyDown(document.activeElement!, { key: 'PageDown' });
      expect(getActiveCell()).to.equal('2-2');
    });

    it('should move up by the amount of rows visible on screen when pressing "PageUp"', () => {
      render(
        <div style={{ width: 500, height: 300 }}>
          <DataGrid {...baselineProps} columns={columns} />
        </div>,
      );

      fireClickEvent(getCell(2, 1));
      expect(getActiveCell()).to.equal('2-1');

      fireEvent.keyDown(document.activeElement!, { key: 'PageUp' });
      expect(getActiveCell()).to.equal('0-0');
    });

    it('should move to the cell below when pressing "Enter" after editing', async () => {
      const editableColumns = columns.map((column) => ({ ...column, editable: true }));
      render(
        <div style={{ width: 500, height: 300 }}>
          <DataGrid {...baselineProps} columns={editableColumns} />
        </div>,
      );

      fireClickEvent(getCell(1, 3));
      expect(getActiveCell()).to.equal('1-3');

      // start editing
      fireEvent.keyDown(document.activeElement!, { key: 'Enter' });

      // commit
      fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
      await waitFor(() => {
        expect(getActiveCell()).to.equal('2-2');
      });
    });

    it('should move to the cell on the right when pressing "Tab" after editing', async () => {
      const editableColumns = columns.map((column) => ({ ...column, editable: true }));
      render(
        <div style={{ width: 500, height: 300 }}>
          <DataGrid {...baselineProps} columns={editableColumns} />
        </div>,
      );

      fireClickEvent(getCell(1, 1));
      expect(getActiveCell()).to.equal('1-1');

      // start editing
      fireEvent.keyDown(document.activeElement!, { key: 'Enter' });

      fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
      await waitFor(() => {
        expect(getActiveCell()).to.equal('1-3');
      });
    });

    it('should move to the cell on the left when pressing "Shift+Tab" after editing', async () => {
      const editableColumns = columns.map((column) => ({ ...column, editable: true }));
      render(
        <div style={{ width: 500, height: 300 }}>
          <DataGrid {...baselineProps} columns={editableColumns} />
        </div>,
      );

      fireClickEvent(getCell(0, 2));
      expect(getActiveCell()).to.equal('0-2');

      // start editing
      fireEvent.keyDown(document.activeElement!, { key: 'Enter' });

      fireEvent.keyDown(document.activeElement!, { key: 'Tab', shiftKey: true });
      await waitFor(() => {
        expect(getActiveCell()).to.equal('0-0');
      });
    });

    it('should work with row virtualization', async () => {
      const rows = [
        {
          id: 0,
          brand: 'Nike',
          category: 'Shoes',
          price: '$120',
        },
        {
          id: 1,
          brand: 'Nike',
          category: 'Shoes',
          price: '$120',
        },
        {
          id: 2,
          brand: 'Nike',
          category: 'Shoes',
          price: '$120',
        },

        {
          id: 3,
          brand: 'Adidas',
          category: 'Shoes',
          price: '$100',
        },
      ];

      const rowHeight = 52;

      render(
        <div style={{ width: 500, height: (rows.length + 1) * rowHeight }}>
          <DataGrid
            columns={[
              { field: 'brand', colSpan: ({ row }) => (row.brand === 'Adidas' ? 2 : 1) },
              { field: 'category' },
              { field: 'price' },
            ]}
            rows={rows}
            rowBuffer={1}
            rowThreshold={1}
            rowHeight={rowHeight}
          />
        </div>,
      );

      fireClickEvent(getCell(1, 1));
      expect(getActiveCell()).to.equal('1-1');

      fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });

      const virtualScroller = document.querySelector(`.${gridClasses.virtualScroller}`)!;
      // trigger virtualization
      virtualScroller.dispatchEvent(new Event('scroll'));

      fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
      const activeCell = getActiveCell();
      // TODO: shouldn't it be 3-0? Looks like data-rowindex is not stable in virtualized mode
      // Should be fixed by https://github.com/mui/mui-x/pull/3882
      expect(activeCell).to.equal('4-0');
    });

    it('should work with column virtualization', () => {
      render(
        <div style={{ width: 200, height: 200 }}>
          <DataGrid
            columns={[
              { field: 'col0', width: 100, colSpan: 3 },
              { field: 'col1', width: 100 },
              { field: 'col2', width: 100 },
              { field: 'col3', width: 100 },
            ]}
            rows={[{ id: 0, col0: '0-0', col1: '0-1', col2: '0-2', col3: '0-3' }]}
            columnBuffer={1}
            columnThreshold={1}
          />
        </div>,
      );

      const virtualScroller = document.querySelector(`.${gridClasses.virtualScroller}`)!;

      virtualScroller.scrollLeft = 200;
      virtualScroller.dispatchEvent(new Event('scroll'));

      fireClickEvent(getCell(0, 3));

      expect(() => getCell(0, 3)).to.not.throw();
      // should be hidden because of first column colSpan
      expect(() => getCell(0, 2)).to.throw(/not found/);
    });

    it('should scroll the whole cell into view when `colSpan` > 1', () => {
      render(
        <div style={{ width: 200, height: 200 }}>
          <DataGrid
            columns={[
              { field: 'col0', width: 100, colSpan: 2 },
              { field: 'col1', width: 100 },
              { field: 'col2', width: 100 },
              { field: 'col3', width: 100, colSpan: 2 },
              { field: 'col4', width: 100 },
            ]}
            rows={[{ id: 0, col0: '0-0', col1: '0-1', col2: '0-2', col3: '0-3', col4: '0-4' }]}
            columnBuffer={1}
            columnThreshold={1}
          />
        </div>,
      );

      fireClickEvent(getCell(0, 0));

      const virtualScroller = document.querySelector(
        `.${gridClasses.virtualScroller}`,
      )! as HTMLElement;

      fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
      virtualScroller.dispatchEvent(new Event('scroll'));
      fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
      virtualScroller.dispatchEvent(new Event('scroll'));
      expect(getActiveCell()).to.equal('0-3');
      // should be scrolled to the end of the cell
      expect(virtualScroller.scrollLeft).to.equal(5 * 100 - virtualScroller.offsetWidth);

      fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
      virtualScroller.dispatchEvent(new Event('scroll'));
      fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
      virtualScroller.dispatchEvent(new Event('scroll'));

      expect(getActiveCell()).to.equal('0-0');
      expect(virtualScroller.scrollLeft).to.equal(0);
    });
  });

  it('should work with filtering', () => {
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
          rows={[
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
            {
              id: 3,
              brand: 'Nike',
              category: 'Shoes',
              price: '$120',
              rating: '4.5',
            },
            {
              id: 4,
              brand: 'Adidas',
              category: 'Shoes',
              price: '$100',
              rating: '4.5',
            },
            {
              id: 5,
              brand: 'Puma',
              category: 'Shoes',
              price: '$90',
              rating: '4.5',
            },
          ]}
          initialState={{
            filter: {
              filterModel: {
                items: [{ columnField: 'brand', operatorValue: 'equals', value: 'Nike' }],
              },
            },
          }}
        />
      </div>,
    );
    // First Nike row
    expect(() => getCell(0, 0)).to.not.throw();
    expect(() => getCell(0, 1)).to.throw(/not found/);
    expect(() => getCell(0, 2)).to.not.throw();
    expect(() => getCell(0, 3)).to.not.throw();

    // Second Nike row
    expect(() => getCell(1, 0)).to.not.throw();
    expect(() => getCell(1, 1)).to.throw(/not found/);
    expect(() => getCell(1, 2)).to.not.throw();
    expect(() => getCell(1, 3)).to.not.throw();
  });
});
