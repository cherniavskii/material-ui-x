import * as React from 'react';
import {
  DataGrid,
  GridColumns,
  GridRowsProp,
  useGridApiContext,
  GridRenderEditCellParams,
  GRID_DATE_COL_DEF,
  GRID_DATETIME_COL_DEF,
  GridColTypeDef,
  GridFilterInputValueProps,
  getGridDateOperators,
} from '@mui/x-data-grid';
import {
  randomCreatedDate,
  randomTraderName,
  randomUpdatedDate,
} from '@mui/x-data-grid-generator';
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TextField from '@mui/material/TextField';
import InputBase from '@mui/material/InputBase';
import locale from 'date-fns/locale/en-US';
import { styled } from '@mui/material/styles';

const dateAdapter = new AdapterDateFns({ locale });

/**
 * `date` column
 */

const dateColumnType: GridColTypeDef<Date | string, string> = {
  ...GRID_DATE_COL_DEF,
  resizable: false,
  renderEditCell: (params) => {
    return <GridEditDateCell {...params} />;
  },
  filterOperators: getGridDateOperators(false).map((item) => ({
    ...item,
    InputComponent: GridFilterDateInput,
    InputComponentProps: { showTime: false },
  })),
  valueFormatter: (params) => {
    if (typeof params.value === 'string') {
      return params.value;
    }
    if (params.value) {
      return dateAdapter.format(params.value, 'keyboardDate');
    }
    return '';
  },
};

const GridEditDateInput = styled(InputBase)({
  fontSize: 'inherit',
  padding: '0 9px',
});

function GridEditDateCell({
  id,
  field,
  value,
  colDef,
}: GridRenderEditCellParams<Date | string | null>) {
  const apiRef = useGridApiContext();

  const Component = colDef.type === 'dateTime' ? DateTimePicker : DatePicker;

  const handleChange = (newValue: unknown) => {
    apiRef.current.setEditCellValue({ id, field, value: newValue });
  };

  return (
    <Component
      value={value}
      renderInput={({ inputRef, inputProps, InputProps, disabled, error }) => (
        <GridEditDateInput
          fullWidth
          autoFocus
          ref={inputRef}
          {...InputProps}
          disabled={disabled}
          error={error}
          inputProps={inputProps}
        />
      )}
      onChange={handleChange}
    />
  );
}

function GridFilterDateInput(
  props: GridFilterInputValueProps & { showTime?: boolean },
) {
  const { item, showTime, applyValue, apiRef } = props;

  const Component = showTime ? DateTimePicker : DatePicker;

  const handleFilterChange = (newValue: unknown) => {
    applyValue({ ...item, value: newValue });
  };

  return (
    <Component
      value={item.value || null}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          label={apiRef.current.getLocaleText('filterPanelInputLabel')}
        />
      )}
      InputAdornmentProps={{
        sx: {
          '& .MuiButtonBase-root': {
            marginRight: -1,
          },
        },
      }}
      onChange={handleFilterChange}
    />
  );
}

/**
 * `dateTime` column
 */

const dateTimeColumnType: GridColTypeDef<Date | string, string> = {
  ...GRID_DATETIME_COL_DEF,
  resizable: false,
  renderEditCell: (params) => {
    return <GridEditDateCell {...params} />;
  },
  filterOperators: getGridDateOperators(true).map((item) => ({
    ...item,
    InputComponent: GridFilterDateInput,
    InputComponentProps: { showTime: true },
  })),
  valueFormatter: (params) => {
    if (typeof params.value === 'string') {
      return params.value;
    }
    if (params.value) {
      return dateAdapter.format(params.value, 'keyboardDateTime');
    }
    return '';
  },
};

const columns: GridColumns = [
  { field: 'name', headerName: 'Name', width: 180, editable: true },
  { field: 'age', headerName: 'Age', type: 'number', editable: true },
  {
    field: 'dateCreated',
    ...dateColumnType,
    headerName: 'Date Created',
    width: 180,
    editable: true,
  },
  {
    field: 'lastLogin',
    ...dateTimeColumnType,
    headerName: 'Last Login',
    width: 230,
    editable: true,
  },
];

export default function EditingWithDatePickers() {
  return (
    <div style={{ height: 300, width: '100%' }}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
        <DataGrid rows={rows} columns={columns} />
      </LocalizationProvider>
    </div>
  );
}

const rows: GridRowsProp = [
  {
    id: 1,
    name: randomTraderName(),
    age: 25,
    dateCreated: randomCreatedDate(),
    lastLogin: randomUpdatedDate(),
  },
  {
    id: 2,
    name: randomTraderName(),
    age: 36,
    dateCreated: randomCreatedDate(),
    lastLogin: randomUpdatedDate(),
  },
  {
    id: 3,
    name: randomTraderName(),
    age: 19,
    dateCreated: randomCreatedDate(),
    lastLogin: randomUpdatedDate(),
  },
  {
    id: 4,
    name: randomTraderName(),
    age: 28,
    dateCreated: randomCreatedDate(),
    lastLogin: randomUpdatedDate(),
  },
  {
    id: 5,
    name: randomTraderName(),
    age: 23,
    dateCreated: randomCreatedDate(),
    lastLogin: randomUpdatedDate(),
  },
];
