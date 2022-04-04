import * as React from 'react';
import {
  gridColumnLookupSelector,
  gridFilteredRowsLookupSelector,
  GridRowId,
  gridRowIdsSelector,
  GridRowTreeConfig,
  gridRowTreeSelector,
} from '@mui/x-data-grid-pro';
import { GridApiPremium } from '../../../models/gridApiPremium';
import {
  GridAggregationFunction,
  GridAggregationLookup,
  GridAggregationPosition,
} from './gridAggregationInterfaces';
import { DataGridPremiumProcessedProps } from '../../../models/dataGridPremiumProps';
import { gridAggregationSanitizedModelSelector } from './gridAggregationSelectors';
import { canColumnHaveAggregationFunction } from './gridAggregationUtils';

const getNonAutoGeneratedDescendants = (tree: GridRowTreeConfig, parentId: GridRowId) => {
  const children = tree[parentId].children;
  if (children == null) {
    return [];
  }

  const validDescendants: GridRowId[] = [];
  for (let i = 0; i < children.length; i += 1) {
    const child = children[i];
    const childNode = tree[child];
    if (!childNode.isAutoGenerated) {
      validDescendants.push(child);
    }
    validDescendants.push(...getNonAutoGeneratedDescendants(tree, childNode.id));
  }

  return validDescendants;
};

const getAggregationCellValue = ({
  apiRef,
  id,
  field,
  aggregationFunction,
  aggregatedRows,
  cellAggregationPosition,
}: {
  apiRef: React.MutableRefObject<GridApiPremium>;
  id: GridRowId;
  field: string;
  aggregationFunction: GridAggregationFunction;
  aggregatedRows: DataGridPremiumProcessedProps['aggregatedRows'];
  cellAggregationPosition: GridAggregationPosition;
}) => {
  const rowTree = gridRowTreeSelector(apiRef);
  const rowNode = apiRef.current.getRowNode(id)!;
  const filteredRowsLookup = gridFilteredRowsLookupSelector(apiRef);

  let rowIds: GridRowId[];
  if (cellAggregationPosition === 'footer') {
    if (rowNode.parent == null) {
      rowIds = gridRowIdsSelector(apiRef).filter((rowId) => !rowTree[rowId].isAutoGenerated);
    } else {
      rowIds = getNonAutoGeneratedDescendants(rowTree, rowNode.parent);
    }
  } else {
    rowIds = getNonAutoGeneratedDescendants(rowTree, rowNode.id);
  }

  if (aggregatedRows === 'filtered') {
    rowIds = rowIds.filter((rowId) => filteredRowsLookup[rowId] !== false);
  }

  return aggregationFunction.apply({
    values: rowIds.map((rowId) => apiRef.current.getCellValue(rowId, field)),
  });
};

export const createAggregationLookup = ({
  apiRef,
  aggregationFunctions,
  aggregationPositionRef,
  aggregatedRows,
  isGroupAggregated,
}: {
  apiRef: React.MutableRefObject<GridApiPremium>;
  aggregationFunctions: Record<string, GridAggregationFunction>;
  aggregationPositionRef: React.MutableRefObject<GridAggregationPosition>;
  isGroupAggregated: DataGridPremiumProcessedProps['isGroupAggregated'];
  aggregatedRows: DataGridPremiumProcessedProps['aggregatedRows'];
}): GridAggregationLookup => {
  if (!aggregationFunctions) {
    return {};
  }

  const aggregationPosition = aggregationPositionRef.current;

  const getRowAggregationPosition = (id: GridRowId): GridAggregationPosition | null => {
    const isGroup = id.toString().startsWith('auto-generated-row-');

    if (isGroup && aggregationPosition === 'inline') {
      if (isGroupAggregated && !isGroupAggregated(apiRef.current.getRowNode(id))) {
        return null;
      }

      return 'inline';
    }

    const isFooter = id.toString().startsWith('auto-generated-group-footer-');
    if (isFooter && aggregationPosition === 'footer') {
      // We don't have to check `isGroupAggregated` because if it returns false, the footer is not created at all
      return 'footer';
    }

    return null;
  };

  const rowIds = gridRowIdsSelector(apiRef);
  const columnsLookup = gridColumnLookupSelector(apiRef);
  const aggregationModel = gridAggregationSanitizedModelSelector(apiRef);
  const aggregatedFields = Object.keys(aggregationModel);

  const aggregationLookup: GridAggregationLookup = {};

  for (let i = 0; i < rowIds.length; i += 1) {
    const rowId = rowIds[i];
    const rowAggregationLookup: GridAggregationLookup[GridRowId] = {};
    const cellAggregationPosition = getRowAggregationPosition(rowId);

    if (cellAggregationPosition != null) {
      for (let j = 0; j < aggregatedFields.length; j += 1) {
        const aggregatedField = aggregatedFields[j];
        const aggregationItem = aggregationModel[aggregatedField];
        const aggregationFunction = aggregationFunctions[aggregationItem];
        const column = columnsLookup[aggregatedField];

        if (
          !canColumnHaveAggregationFunction({
            column,
            aggregationFunction,
            aggregationFunctionName: aggregationItem,
          })
        ) {
          throw new Error(
            `MUI: The aggregation function "${aggregationItem}" is not applicable to the column "${column.field}" of type "${column.type}"`,
          );
        }

        rowAggregationLookup[aggregatedField] = getAggregationCellValue({
          apiRef,
          id: rowId,
          field: aggregatedField,
          aggregationFunction,
          aggregatedRows,
          cellAggregationPosition,
        });
      }

      aggregationLookup[rowId] = rowAggregationLookup;
    }
  }

  return aggregationLookup;
};
