import * as React from 'react';
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';

export interface DataRowModel {
  id: GridRowId;
  [price: string]: number | string;
}

export interface GridData {
  columns: GridColDef[];
  rows: DataRowModel[];
}

function getData(rowLength: number, columnLength: number) {
  const rows: DataRowModel[] = [];

  for (let i = 0; i < rowLength; i += 1) {
    const row: DataRowModel = {
      id: i,
    };

    for (let j = 1; j <= columnLength; j += 1) {
      row[`price${j}M`] = `${i.toString()}, ${j} `;
    }

    rows.push(row);
  }

  const columns: GridColDef[] = [];

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
