import * as React from 'react';
import {
  DataGridPremium,
  useGridApiRef,
  unstable_useGridPivoting,
} from '@mui/x-data-grid-premium';

const initialRows = [
  { id: 1, product: 'Product 1', type: 'Type A', price: 10, quantity: 2 },
  { id: 2, product: 'Product 2', type: 'Type A', price: 12, quantity: 3 },
  { id: 3, product: 'Product 3', type: 'Type B', price: 8, quantity: 1 },
  { id: 4, product: 'Product 4', type: 'Type C', price: 20, quantity: 8 },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const initialColumns = [
  { field: 'product' },
  { field: 'type' },
  {
    field: 'price',
    valueFormatter: (value) => {
      if (!value) {
        return '';
      }
      return currencyFormatter.format(value);
    },
  },
  { field: 'quantity' },
];

export default function GridPivotingBasic() {
  const apiRef = useGridApiRef();

  const [pivotModel, setPivotModel] = React.useState({
    rows: [{ field: 'type' }],
    columns: [],
    values: [{ field: 'price', aggFunc: 'sum' }],
  });

  const [isPivotMode, setIsPivotMode] = React.useState(false);

  const pivotParams = unstable_useGridPivoting({
    apiRef,
    pivotModel,
    onPivotModelChange: setPivotModel,
    pivotMode: isPivotMode,
    onPivotModeChange: setIsPivotMode,
  });

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPremium
        rows={initialRows}
        columns={initialColumns}
        pivotParams={pivotParams}
        apiRef={apiRef}
        columnGroupHeaderHeight={36}
      />
    </div>
  );
}
