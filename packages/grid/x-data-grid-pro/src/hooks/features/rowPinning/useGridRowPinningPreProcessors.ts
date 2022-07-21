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
  params,
  rowModel,
  rowId,
  position,
  apiRef,
}: {
  params: GridHydrateRowsValue;
  rowModel: GridRowModel;
  rowId: GridRowId;
  position: GridPinnedRowPosition;
  apiRef: React.MutableRefObject<GridApiPro>;
}) {
  const tree = { ...params.tree };
  const treeDepths = { ...params.treeDepths };

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

  const previousPinnedRows = params.additionalRowGroups?.pinnedRows || {};

  return {
    ...params,
    tree,
    additionalRowGroups: {
      ...params.additionalRowGroups,
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

      let newParams = {
        ...value,
        additionalRowGroups: {
          ...value.additionalRowGroups,
          // reset pinned rows state
          pinnedRows: {},
        },
      };

      pinnedRowsTop.forEach((row) => {
        const rowId = getRowIdFromRowModel(row, props.getRowId);
        newParams = addPinnedRow({
          params: newParams,
          rowModel: row,
          rowId,
          position: 'top',
          apiRef,
        });
      });
      pinnedRowsBottom.forEach((row) => {
        const rowId = getRowIdFromRowModel(row, props.getRowId);
        newParams = addPinnedRow({
          params: newParams,
          rowModel: row,
          rowId,
          position: 'bottom',
          apiRef,
        });
      });

      return newParams;
    },
    [apiRef, props.getRowId],
  );

  useGridRegisterPipeProcessor(apiRef, 'hydrateRows', addPinnedRows);
};
