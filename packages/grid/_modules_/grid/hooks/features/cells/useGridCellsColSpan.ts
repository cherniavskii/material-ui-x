import React from 'react';
import { GridApiCommon } from '../../../models/api/gridApiCommon';
import { useGridApiMethod } from '../../utils/useGridApiMethod';
import { GridCellParams } from '../../../models/params/gridCellParams';
import { GridRowIndex, GridColumnIndex, GridCellMeta } from '../../../models/gridCellsColSpan';

export const useGridCellsColSpan = (apiRef: React.MutableRefObject<GridApiCommon>) => {
  const lookup = React.useRef<Record<GridRowIndex, Record<GridColumnIndex, GridCellMeta>>>({});

  const setCellMeta = React.useCallback(
    (rowIndex: GridRowIndex, columnIndex: GridColumnIndex, size: GridCellMeta) => {
      const sizes = lookup.current;
      if (!sizes[rowIndex]) {
        sizes[rowIndex] = {};
      }

      sizes[rowIndex][columnIndex] = size;
    },
    [],
  );

  const getCellMeta = React.useCallback(
    (rowIndex: GridRowIndex, columnIndex: GridColumnIndex): GridCellMeta | undefined => {
      return lookup.current[rowIndex]?.[columnIndex];
    },
    [],
  );

  const getCellProps = React.useCallback(
    ({
      columnIndex,
      rowIndex,
      cellParams,
    }: {
      columnIndex: number;
      rowIndex: number;
      cellParams: GridCellParams;
    }) => {
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
          if (visibleColumns[nextColumnIndex]) {
            const nextColumn = visibleColumns[nextColumnIndex];
            width += nextColumn.computedWidth;
            setCellMeta(rowIndex, columnIndex + j, {
              spanned: true,
              nextCellIndex: Math.min(columnIndex + colSpan, columnsLength - 1),
              prevCellIndex: columnIndex,
            });
            dataColSpanAttributes[`data-colspan-allocates-field-${nextColumn.field}`] = '1';
          }
        }
      } else {
        setCellMeta(rowIndex, columnIndex, {
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

  const cellsMetaApi = {
    unstable_calculateCellSize: getCellProps,
    unstable_getCellSize: getCellMeta,
  };

  useGridApiMethod(apiRef, cellsMetaApi, 'GridCellsMetaApi');
};
