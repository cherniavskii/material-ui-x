import * as React from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useDemoData } from '@mui/x-data-grid-generator/';

export default function RowPinningWithPagination() {
  const { data } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 100,
    maxColumns: 20,
  });

  const rowsData = React.useMemo(() => {
    if (!data.rows || data.rows.length === 0) {
      return { rows: data.rows };
    }
    const [firstRow, secondRow, thirdRow, ...rows] = data.rows;
    return {
      rows,
      pinnedRows: {
        top: [firstRow],
        bottom: [secondRow, thirdRow],
      },
    };
  }, [data.rows]);

  return (
    <div style={{ height: 500, width: '100%' }}>
      <DataGridPro
        {...data}
        rows={rowsData.rows}
        pinnedRows={rowsData.pinnedRows}
        initialState={{
          pagination: {
            pageSize: 10,
          },
        }}
        pagination
        rowsPerPageOptions={[5, 10]}
      />
    </div>
  );
}
