import * as React from 'react';
import {
  gridColumnLookupSelector,
  gridFilteredRowsLookupSelector,
  GridRowId,
  gridRowIdsSelector,
  GridRowTreeConfig,
  gridRowTreeSelector,
} from '@mui/x-data-grid';
import { GridApiPro } from '../../../models/gridApiPro';
import {
  GridAggregationFunction,
  GridAggregationLookup,
  GridAggregationPosition,
} from './gridAggregationInterfaces';
import { DataGridProProcessedProps } from '../../../models/dataGridProProps';
import { gridAggregationSanitizedModelSelector } from './gridAggregationSelectors';

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
  cellAggregationPosition,
}: {
  apiRef: React.MutableRefObject<GridApiPro>;
  id: GridRowId;
  field: string;
  aggregationFunction: GridAggregationFunction;
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

  return aggregationFunction.apply({
    values: rowIds
      .filter((rowId) => filteredRowsLookup[rowId] !== false)
      .map((rowId) => apiRef.current.getCellValue(rowId, field)),
  });
};

export const createAggregationLookup = ({
  apiRef,
  aggregationFunctions,
  aggregationPositionRef,
  isGroupAggregated,
}: {
  apiRef: React.MutableRefObject<GridApiPro>;
  aggregationFunctions: Record<string, GridAggregationFunction>;
  aggregationPositionRef: React.MutableRefObject<GridAggregationPosition>;
  isGroupAggregated: DataGridProProcessedProps['isGroupAggregated'];
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
        const aggregationFunction = aggregationFunctions[aggregationModel[aggregatedField]];
        const colDef = columnsLookup[aggregatedField];

        if (!aggregationFunction.types.includes(colDef.type!)) {
          throw new Error(
            `MUI: The current aggregation function is not application to the type "${colDef.type}"`,
          );
        }

        rowAggregationLookup[aggregatedField] = getAggregationCellValue({
          apiRef,
          id: rowId,
          field: aggregatedField,
          aggregationFunction,
          cellAggregationPosition,
        });
      }

      aggregationLookup[rowId] = rowAggregationLookup;
    }
  }

  return aggregationLookup;
};
