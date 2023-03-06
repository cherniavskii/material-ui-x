import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { DataGridPro, GridColDef, GridRowParams } from '@mui/x-data-grid-pro';
import {
  randomEmail,
  randomInt,
  randomCommodity,
  randomPrice,
} from '@mui/x-data-grid-generator';

function generateProducts() {
  const quantity = randomInt(1, 5);
  return [...Array(quantity)].map((_, index) => ({
    id: index,
    name: randomCommodity(),
    quantity: randomInt(1, 5),
    unitPrice: randomPrice(1, 1000),
  }));
}

function DetailPanelContent({ row: rowProp }: { row: Customer }) {
  const [isLoading, setLoading] = React.useState(true);
  const [products, setProducts] = React.useState<(typeof productsMap)[number]>([]);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setProducts(productsMap[rowProp.id]);
      setLoading(false);
    }, 1000);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [rowProp.id]);

  return (
    <Stack
      sx={{ py: 2, height: '100%', boxSizing: 'border-box' }}
      direction="column"
    >
      <Paper sx={{ flex: 1, mx: 'auto', width: '90%', p: 1 }}>
        <Stack direction="column" spacing={1} sx={{ height: 1 }}>
          <Typography variant="h6">{`Order #${rowProp.id}`}</Typography>
          <DataGridPro
            density="compact"
            loading={isLoading}
            columns={[
              { field: 'name', headerName: 'Product', flex: 1 },
              {
                field: 'quantity',
                headerName: 'Quantity',
                align: 'center',
                type: 'number',
              },
              { field: 'unitPrice', headerName: 'Unit Price', type: 'number' },
              {
                field: 'total',
                headerName: 'Total',
                type: 'number',
                valueGetter: ({ row }) => row.quantity * row.unitPrice,
              },
            ]}
            rows={products}
            sx={{ flex: 1 }}
            hideFooter
          />
        </Stack>
      </Paper>
    </Stack>
  );
}

const columns: GridColDef[] = [
  { field: 'id', headerName: 'Order ID' },
  { field: 'customer', headerName: 'Customer', width: 200 },
  { field: 'email', headerName: 'Email', width: 200 },
];

const rows = [
  {
    id: 1,
    customer: 'Matheus',
    email: randomEmail(),
  },
  {
    id: 2,
    customer: 'Olivier',
    email: randomEmail(),
  },
  {
    id: 3,
    customer: 'Flavien',
    email: randomEmail(),
  },
  {
    id: 4,
    customer: 'Danail',
    email: randomEmail(),
  },
  {
    id: 5,
    customer: 'Alexandre',
    email: randomEmail(),
  },
];

const productsMap: Record<Customer['id'], ReturnType<typeof generateProducts>> = {};
rows.forEach((row) => {
  productsMap[row.id] = generateProducts();
});

type Customer = (typeof rows)[number];

export default function FetchDetailPanelContentOnOnen() {
  const getDetailPanelContent = React.useCallback(
    ({ row }: GridRowParams) => <DetailPanelContent row={row} />,
    [],
  );

  const getDetailPanelHeight = React.useCallback(() => 240, []);

  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <DataGridPro
        columns={columns}
        rows={rows}
        getDetailPanelHeight={getDetailPanelHeight}
        getDetailPanelContent={getDetailPanelContent}
      />
    </Box>
  );
}
