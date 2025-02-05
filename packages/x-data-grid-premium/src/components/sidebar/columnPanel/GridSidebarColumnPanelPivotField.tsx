import * as React from 'react';
import { styled } from '@mui/material/styles';
import { getDataGridUtilityClass, GridColDef, GridSortDirection } from '@mui/x-data-grid';
import FormControlLabel, { formControlLabelClasses } from '@mui/material/FormControlLabel';
import Typography, { typographyClasses } from '@mui/material/Typography';

import Select, { selectClasses } from '@mui/material/Select';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';
import composeClasses from '@mui/utils/composeClasses';
import { DataGridProcessedProps } from '@mui/x-data-grid/internals';
import type { DataGridPremiumProcessedProps } from '../../../models/dataGridPremiumProps';
import { PivotModel } from '../../../hooks/features/pivoting/useGridPivoting';
import { useGridRootProps } from '../../../typeOverloads/reexports';
import { getAvailableAggregationFunctions } from '../../../hooks/features/aggregation/gridAggregationUtils';
import { GridSidebarColumnPanelPivotMenu as PivotMenu } from './GridSidebarColumnPanelPivotMenu';
import type {
  DropPosition,
  FieldTransferObject,
  UpdatePivotModel,
} from './GridSidebarColumnPanelBody';

type PivotFieldProps = {
  children: React.ReactNode;
  field: FieldTransferObject['field'];
  pivotModel: PivotModel;
  updatePivotModel: UpdatePivotModel;
  onPivotModelChange: React.Dispatch<React.SetStateAction<PivotModel>>;
  slots: DataGridPremiumProcessedProps['slots'];
  slotProps: DataGridPremiumProcessedProps['slotProps'];
  onDragStart: (modelKey: FieldTransferObject['modelKey']) => void;
  onDragEnd: () => void;
} & (
  | { modelKey: 'columns'; sort: PivotModel['columns'][number]['sort']; hidden?: boolean }
  | { modelKey: 'rows'; hidden?: boolean }
  | {
      modelKey: 'values';
      aggFunc: PivotModel['values'][number]['aggFunc'];
      colDef: GridColDef;
      hidden?: boolean;
    }
  | { modelKey: null }
);

type OwnerState = PivotFieldProps & {
  classes?: DataGridProcessedProps['classes'];
};

const useUtilityClasses = (ownerState: OwnerState) => {
  const { classes, modelKey } = ownerState;
  const sorted = modelKey === 'columns' && ownerState.sort;
  const slots = {
    root: ['pivotField', sorted && 'pivotField--sorted'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

const PivotFieldRoot = styled('div', {
  name: 'MuiDataGrid',
  slot: 'PivotField',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) =>
    prop !== 'dropPosition' && prop !== 'section' && prop !== 'ownerState',
})<{
  ownerState: OwnerState;
  dropPosition: DropPosition;
  section: FieldTransferObject['modelKey'];
}>(({ theme }) => ({
  flexShrink: 0,
  paddingRight: theme.spacing(1),
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  borderWidth: 0,
  borderTopWidth: 2,
  borderBottomWidth: 2,
  borderStyle: 'solid',
  borderColor: 'transparent',
  margin: '-1px 0', // collapse vertical borders
  cursor: 'grab',
  variants: [
    { props: { dropPosition: 'top' }, style: { borderTopColor: theme.palette.primary.main } },
    {
      props: { dropPosition: 'bottom' },
      style: { borderBottomColor: theme.palette.primary.main },
    },
    {
      props: { section: null },
      style: { borderTopColor: 'transparent', borderBottomColor: 'transparent' },
    },
  ],
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const PivotFieldLabel = styled('div')(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  [`.${formControlLabelClasses.root}`]: {
    width: '100%',
    cursor: 'grab',
  },
  [`.${typographyClasses.root}`]: {
    fontSize: theme.typography.pxToRem(14),
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

const PivotFieldActionContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

const PivotFieldDragIcon = styled('div')(({ theme }) => ({
  width: 16,
  display: 'flex',
  justifyContent: 'center',
  color: theme.palette.text.primary,
  opacity: 0,
  marginRight: theme.spacing(-0.5),
  '[draggable="true"]:hover > &': {
    opacity: 0.3,
  },
}));

const AggregationSelectRoot = styled(Select)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(12),
  [`& .${selectClasses.select}.${selectClasses.outlined}.${outlinedInputClasses.input}`]: {
    padding: theme.spacing(0.75, 3, 0.75, 1),
  },
  [`& .${selectClasses.icon}`]: {
    right: 0,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  [`&:not(:focus-within) .${outlinedInputClasses.notchedOutline}`]: {
    border: 0,
  },
}));

function AggregationSelect({
  aggFunc,
  field,
  onPivotModelChange,
  colDef,
}: {
  aggFunc: PivotModel['values'][number]['aggFunc'];
  field: FieldTransferObject['field'];
  onPivotModelChange: React.Dispatch<React.SetStateAction<PivotModel>>;
  colDef: GridColDef;
}) {
  const rootProps = useGridRootProps();

  const availableAggregationFunctions = React.useMemo(
    () =>
      getAvailableAggregationFunctions({
        aggregationFunctions: rootProps.aggregationFunctions,
        colDef,
        isDataSource: false,
      }),
    [colDef, rootProps.aggregationFunctions],
  );

  return (
    <AggregationSelectRoot
      as={rootProps.slots.baseSelect}
      {...rootProps.slotProps?.baseSelect}
      size="small"
      variant="outlined"
      value={aggFunc}
      onChange={(event) => {
        const newValue = event.target.value as string;
        onPivotModelChange((prev) => {
          return {
            ...prev,
            values: prev.values.map((col) => {
              if (col.field === field) {
                return {
                  ...col,
                  aggFunc: newValue,
                };
              }
              return col;
            }),
          };
        });
      }}
    >
      {availableAggregationFunctions.map((func) => (
        <rootProps.slots.baseSelectOption
          key={func}
          value={func}
          native={false}
          // @ts-ignore TODO: Fix types for MUISelectOption
          dense
        >
          {func}
        </rootProps.slots.baseSelectOption>
      ))}
    </AggregationSelectRoot>
  );
}

export function PivotField(props: PivotFieldProps) {
  const {
    children,
    field,
    pivotModel,
    slots,
    updatePivotModel,
    onPivotModelChange,
    onDragStart,
    onDragEnd,
  } = props;
  const rootProps = useGridRootProps();
  const ownerState = { ...props, classes: rootProps.classes };
  const classes = useUtilityClasses(ownerState);

  const [dropPosition, setDropPosition] = React.useState<DropPosition>(null);

  const handleDragStart = React.useCallback(
    (event: React.DragEvent) => {
      const data: FieldTransferObject = { field, modelKey: props.modelKey };
      event.dataTransfer.setData('text/plain', JSON.stringify(data));
      event.dataTransfer.dropEffect = 'move';
      onDragStart(props.modelKey);
    },
    [field, onDragStart, props.modelKey],
  );

  const getDropPosition = React.useCallback((event: React.DragEvent): DropPosition => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const y = event.clientY - rect.top;
    if (y < rect.height / 2) {
      return 'top';
    }
    return 'bottom';
  }, []);

  const handleDragOver = React.useCallback(
    (event: React.DragEvent) => {
      if (!event.currentTarget.contains(event.relatedTarget as HTMLElement)) {
        setDropPosition(getDropPosition(event));
      }
    },
    [getDropPosition],
  );

  const handleDragLeave = React.useCallback((event: React.DragEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget as HTMLElement)) {
      setDropPosition(null);
    }
  }, []);

  const handleDrop = React.useCallback(
    (event: React.DragEvent) => {
      setDropPosition(null);

      if (!event.currentTarget.contains(event.relatedTarget as HTMLElement)) {
        event.preventDefault();

        const position = getDropPosition(event);

        const { field: droppedField, modelKey: originSection } = JSON.parse(
          event.dataTransfer.getData('text/plain'),
        ) as FieldTransferObject;

        updatePivotModel({
          field: droppedField,
          targetField: field,
          targetFieldPosition: position,
          originSection,
          targetSection: props.modelKey,
        });
      }
    },
    [getDropPosition, updatePivotModel, field, props.modelKey],
  );

  const handleSort = () => {
    const currentSort = props.modelKey === 'columns' ? props.sort : null;
    let newValue: GridSortDirection;

    if (currentSort === 'asc') {
      newValue = 'desc';
    } else if (currentSort === 'desc') {
      newValue = undefined;
    } else {
      newValue = 'asc';
    }

    onPivotModelChange((prev) => {
      return {
        ...prev,
        columns: prev.columns.map((col) => {
          if (col.field === field) {
            return {
              ...col,
              sort: newValue,
            };
          }
          return col;
        }),
      };
    });
  };

  const handleVisibilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (props.modelKey) {
      onPivotModelChange((prev) => {
        return {
          ...prev,
          [props.modelKey]: prev[props.modelKey].map((col) => {
            if (col.field === field) {
              return { ...col, hidden: !event.target.checked };
            }
            return col;
          }),
        };
      });
    }
  };

  const hideable = props.modelKey !== null;

  return (
    <PivotFieldRoot
      ownerState={ownerState}
      className={classes.root}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      dropPosition={dropPosition}
      section={props.modelKey}
      draggable="true"
    >
      <PivotFieldDragIcon>
        <slots.columnReorderIcon fontSize="small" />
      </PivotFieldDragIcon>

      <PivotFieldLabel>
        {hideable ? (
          <FormControlLabel
            control={
              <rootProps.slots.baseCheckbox
                size="small"
                {...rootProps.slotProps?.baseCheckbox}
                checked={!props.hidden}
                onChange={handleVisibilityChange}
              />
            }
            label={children}
          />
        ) : (
          <Typography>{children}</Typography>
        )}
      </PivotFieldLabel>

      <PivotFieldActionContainer>
        {props.modelKey === 'columns' && (
          // TODO: finalize this functionality
          // - do we need to define an index here?
          // - should rootProps.disableColumnSorting, colDef.sortable, and colDef.hideSortIcons be respected in pivot mode?
          <rootProps.slots.columnHeaderSortIcon
            field={field}
            direction={props.sort}
            index={undefined}
            sortingOrder={rootProps.sortingOrder}
            {...rootProps.slotProps?.columnHeaderSortIcon}
            onClick={handleSort}
          />
        )}
        {props.modelKey === 'values' && (
          <AggregationSelect
            aggFunc={props.aggFunc}
            field={field}
            colDef={props.colDef}
            onPivotModelChange={onPivotModelChange}
          />
        )}
        <PivotMenu
          field={field}
          modelKey={props.modelKey}
          pivotModel={pivotModel}
          updatePivotModel={updatePivotModel}
        />
      </PivotFieldActionContainer>
    </PivotFieldRoot>
  );
}
