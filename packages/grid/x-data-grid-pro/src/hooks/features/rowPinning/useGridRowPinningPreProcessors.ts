import * as React from 'react';
import {
  getRowIdFromRowModel,
  GridHydrateRowsValue,
  GridPipeProcessor,
  useGridRegisterPipeProcessor,
} from '@mui/x-data-grid/internals';
import { GridPinnedNode, GridRowId, GridRowModel } from '@mui/x-data-grid';
import { GridApiPro } from '../../../models/gridApiPro';
import { DataGridProProcessedProps } from '../../../models/dataGridProProps';
import { GridPinnedRowsProp } from './gridRowPinningInterface';
import { insertNodeInTree } from '../../../utils/tree/utils';

type GridPinnedRowPosition = keyof GridPinnedRowsProp;

export function addPinnedRow({
  groupingParams,
  rowModel,
  rowId,
  position,
  apiRef,
}: {
  groupingParams: GridHydrateRowsValue;
  rowModel: GridRowModel;
  rowId: GridRowId;
  position: GridPinnedRowPosition;
  apiRef: React.MutableRefObject<GridApiPro>;
}) {
  const tree = { ...groupingParams.tree };
  const treeDepths = { ...groupingParams.treeDepths };

  // TODO: warn if id is already present in `props.rows`
  const treeNode: GridPinnedNode = {
    type: 'pinned',
    id: rowId,
    depth: 0,
    position,
    parent: null,
  };

  insertNodeInTree({ node: treeNode, tree, treeDepths });

  apiRef.current.unstable_caches.rows.dataRowIdToModelLookup[rowId] = { ...rowModel };
  apiRef.current.unstable_caches.rows.dataRowIdToIdLookup[rowId] = rowId;

  const previousPinnedRows = groupingParams.additionalRowGroups?.pinnedRows || {};

  return {
    ...groupingParams,
    tree,
    additionalRowGroups: {
      ...groupingParams.additionalRowGroups,
      pinnedRows: {
        ...previousPinnedRows,
        [position]: [
          ...(previousPinnedRows[position] || []),
          {
            id: rowId,
            rowModel,
          },
        ],
      },
    },
  };
}

export const useGridRowPinningPreProcessors = (
  apiRef: React.MutableRefObject<GridApiPro>,
  props: Pick<DataGridProProcessedProps, 'pinnedRows' | 'getRowId'>,
) => {
  const addPinnedRows = React.useCallback<GridPipeProcessor<'hydrateRows'>>(
    (value: GridHydrateRowsValue) => {
      const pinnedRows = apiRef.current.unstable_caches.pinnedRows;
      const pinnedRowsTop = pinnedRows?.top || [];
      const pinnedRowsBottom = pinnedRows?.bottom || [];

      let newGroupingParams = {
        ...value,
        additionalRowGroups: {
          ...value.additionalRowGroups,
          // reset pinned rows state
          pinnedRows: {},
        },
      };

      pinnedRowsTop.forEach((row) => {
        const rowId = getRowIdFromRowModel(row, props.getRowId);
        newGroupingParams = addPinnedRow({
          groupingParams: newGroupingParams,
          rowModel: row,
          rowId,
          position: 'top',
          apiRef,
        });
      });
      pinnedRowsBottom.forEach((row) => {
        const rowId = getRowIdFromRowModel(row, props.getRowId);
        newGroupingParams = addPinnedRow({
          groupingParams: newGroupingParams,
          rowModel: row,
          rowId,
          position: 'bottom',
          apiRef,
        });
      });

      return newGroupingParams;
    },
    [apiRef, props.getRowId],
  );

  useGridRegisterPipeProcessor(apiRef, 'hydrateRows', addPinnedRows);
};
