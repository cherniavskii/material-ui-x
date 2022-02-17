import React from 'react';
import { GridApiCommon } from '../../../models/api/gridApiCommon';
import { useGridApiMethod } from '../../utils/useGridApiMethod';
import { GridColumnIndex, GridCellMeta } from '../../../models/gridCellsColSpan';
import { GridRowId } from '../../../models/gridRows';
import { GridCellsColSpan } from '../../../models/api/gridCellsColSpan';
import { useGridApiEventHandler } from '../../utils/useGridApiEventHandler';
import { GridEvents } from '../../../models/events/gridEvents';

export const useGridCellsColSpan = (apiRef: React.MutableRefObject<GridApiCommon>) => {
  const lookup = React.useRef<Record<GridRowId, Record<GridColumnIndex, GridCellMeta>>>({});

  const setCellMeta = React.useCallback(
    (rowIndex: GridRowId, columnIndex: GridColumnIndex, size: GridCellMeta) => {
      const sizes = lookup.current;
      if (!sizes[rowIndex]) {
        sizes[rowIndex] = {};
      }

      sizes[rowIndex][columnIndex] = size;
    },
    [],
  );

  const getCellMeta = React.useCallback<GridCellsColSpan['unstable_getCellSize']>(
    (rowId: GridRowId, columnIndex: GridColumnIndex): GridCellMeta | undefined => {
      return lookup.current[rowId]?.[columnIndex];
    },
    [],
  );

  const getCellProps = React.useCallback<GridCellsColSpan['unstable_calculateCellSize']>(
    ({ columnIndex, rowId, cellParams, renderedColumns }) => {
      const visibleColumns = apiRef.current.getVisibleColumns();
      const columnsLength = visibleColumns.length;
      const column = visibleColumns[columnIndex];

      let width = column.computedWidth;

      let colSpan =
        typeof column.colSpan === 'function' ? column.colSpan(cellParams) : column.colSpan;

      if (typeof colSpan === 'undefined') {
        colSpan = 1;
      }

      // Attributes used by `useGridColumnResize` to update column width during resizing.
      // This makes resizing smooth even for cells with colspan > 1.
      const dataColSpanAttributes: Record<string, string> = {};

      if (colSpan > 1) {
        for (let j = 1; j < colSpan; j += 1) {
          const nextColumnIndex = columnIndex + j;
          if (renderedColumns[nextColumnIndex]) {
            const nextColumn = renderedColumns[nextColumnIndex];
            width += nextColumn.computedWidth;
            setCellMeta(rowId, columnIndex + j, {
              spanned: true,
              nextCellIndex: Math.min(columnIndex + colSpan, columnsLength - 1),
              prevCellIndex: columnIndex,
            });
            dataColSpanAttributes[`data-colspan-allocates-field-${nextColumn.field}`] = '1';
          }
        }
      } else {
        setCellMeta(rowId, columnIndex, {
          spanned: false,
          nextCellIndex: columnIndex + 1,
          prevCellIndex: columnIndex - 1,
        });
      }

      return {
        colSpan,
        width,
        ...dataColSpanAttributes,
      };
    },
    [apiRef, setCellMeta],
  );

  const cellsMetaApi: GridCellsColSpan = {
    unstable_calculateCellSize: getCellProps,
    unstable_getCellSize: getCellMeta,
  };

  useGridApiMethod(apiRef, cellsMetaApi, 'GridCellsMetaApi');

  const handleColumnReorderChange = React.useCallback(() => {
    // `colSpan` needs to be recalculated after column reordering
    lookup.current = {};
  }, []);

  useGridApiEventHandler(apiRef, GridEvents.columnOrderChange, handleColumnReorderChange);
};
