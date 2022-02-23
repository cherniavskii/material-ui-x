import React from 'react';
import { GridApiCommon } from '../../../models/api/gridApiCommon';
import { useGridApiMethod } from '../../utils/useGridApiMethod';
import { GridColumnIndex, GridCellMeta } from '../../../models/gridColumnSpanning';
import { GridRowId } from '../../../models/gridRows';
import { GridColumnSpanning } from '../../../models/api/gridColumnSpanning';
import { useGridApiEventHandler } from '../../utils/useGridApiEventHandler';
import { GridEvents } from '../../../models/events/gridEvents';
import { GridCellParams } from '../../../models/params/gridCellParams';
import { GridStateColDef } from '../../../models/colDef/gridColDef';
import { GridApiCommunity } from '../../../models/api/gridApiCommunity';

/**
 * TODO
 */
export const useGridColumnSpanning = (apiRef: React.MutableRefObject<GridApiCommon>) => {
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

  const getCellMeta = React.useCallback<GridColumnSpanning['unstable_getCellMeta']>(
    (rowId, columnIndex) => {
      return lookup.current[rowId]?.[columnIndex];
    },
    [],
  );

  // Calculate `colSpan` for the cell.
  const calculateCellColSpan = React.useCallback(
    (params: {
      columnIndex: number;
      rowId: GridRowId;
      cellParams: GridCellParams;
      renderedColumns: GridStateColDef<GridApiCommunity>[];
    }) => {
      const { columnIndex, rowId, cellParams, renderedColumns } = params;
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
          const nextColumn = visibleColumns[nextColumnIndex];
          // TODO: consider using column field insteead of index. Is there a lookup?
          // `renderedColumns` does not include pinned columns.
          if (renderedColumns.includes(nextColumn)) {
            width += nextColumn.computedWidth;

            dataColSpanAttributes[
              /**
               * `.toLowerCase()` is used to avoid React warning when using camelCase field name.
               * querySelectorAll() still works when querying with camelCase field name.
               */
              `data-colspan-allocates-field-${nextColumn.field.toLowerCase()}`
            ] = '1';

            setCellMeta(rowId, columnIndex + j, {
              collapsedByColSpan: true,
              rightVisibleCellIndex: Math.min(columnIndex + colSpan, columnsLength - 1),
              leftVisibleCellIndex: columnIndex,
            });
          }
        }
        dataColSpanAttributes['aria-colspan'] = String(colSpan);
      }

      setCellMeta(rowId, columnIndex, {
        collapsedByColSpan: false,
        cellProps: {
          colSpan,
          width,
          other: dataColSpanAttributes,
        },
      });

      return {
        colSpan,
      };
    },
    [apiRef, setCellMeta],
  );
  // Calculate `colSpan` for each cell in the row
  const calculateColSpan = React.useCallback<GridColumnSpanning['unstable_calculateColSpan']>(
    ({ rowId, minFirstColumn, maxLastColumn }) => {
      const visibleColumns = apiRef.current.getVisibleColumns();
      const renderedColumns = visibleColumns.slice(minFirstColumn, maxLastColumn);

      for (let i = minFirstColumn; i < maxLastColumn; i += 1) {
        const column = visibleColumns[i];
        const cellProps = calculateCellColSpan({
          columnIndex: i,
          rowId,
          renderedColumns,
          cellParams: apiRef.current.getCellParams(rowId, column.field),
        });
        if (cellProps.colSpan > 1) {
          i += cellProps.colSpan - 1;
        }
      }
    },
    [apiRef, calculateCellColSpan],
  );

  const cellsMetaApi: GridColumnSpanning = {
    unstable_getCellMeta: getCellMeta,
    unstable_calculateColSpan: calculateColSpan,
  };

  useGridApiMethod(apiRef, cellsMetaApi, 'GridColumnSpanningAPI');

  const handleColumnReorderChange = React.useCallback(() => {
    // `colSpan` needs to be recalculated after column reordering
    lookup.current = {};
  }, []);

  useGridApiEventHandler(apiRef, GridEvents.columnOrderChange, handleColumnReorderChange);
};
