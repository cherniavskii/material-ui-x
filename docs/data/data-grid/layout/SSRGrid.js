import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';

function getData(rowLength, columnLength) {
  const rows = [];

  for (let i = 0; i < rowLength; i += 1) {
    const row = {
      id: i,
    };

    for (let j = 1; j <= columnLength; j += 1) {
      row[`price${j}M`] = `${i.toString()}, ${j} `;
    }

    rows.push(row);
  }

  const columns = [];

  for (let j = 1; j <= columnLength; j += 1) {
    columns.push({ field: `price${j}M`, headerName: `${j}M` });
  }

  return { rows, columns };
}

export default function SSRGrid() {
  const [data] = React.useState(() => getData(100, 1000));

  return (
    <div style={{ height: 600, width: '100%' }}>
      <DataGrid {...data} columnBuffer={2} columnThreshold={2} />
    </div>
  );
}
