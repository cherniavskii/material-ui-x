import * as React from 'react';
import {
  DataGridPremium,
  GridAggregationModel,
  GridColDef,
} from '@mui/x-data-grid-premium';
import { useMovieData } from '@mui/x-data-grid-generator';

const COLUMNS: GridColDef[] = [
  { field: 'title', headerName: 'Title', width: 200, groupable: false },
  {
    field: 'gross',
    headerName: 'Gross',
    type: 'number',
    width: 150,
    groupable: false,
    valueFormatter: ({ value }) => {
      if (!value || typeof value !== 'number') {
        return value;
      }
      return `${value.toLocaleString()}$`;
    },
  },
];

export default function AggregationControlled() {
  const data = useMovieData();

  const [aggregationModel, setAggregationModel] =
    React.useState<GridAggregationModel>({
      gross: 'sum',
    });

  return (
    <DataGridPremium
      // The 2 following props are here to avoid scroll in the demo while we don't have pinned rows
      rows={data.rows.slice(0, 3)}
      autoHeight
      columns={COLUMNS}
      aggregationModel={aggregationModel}
      onAggregationModelChange={(newModel) => setAggregationModel(newModel)}
      experimentalFeatures={{
        aggregation: true,
      }}
    />
  );
}
