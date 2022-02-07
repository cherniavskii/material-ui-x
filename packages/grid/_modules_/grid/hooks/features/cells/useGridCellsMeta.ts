import React from 'react';
import { GridState } from '../../../models/gridState';
import { GridApiRef } from '../../../models/api/gridApiRef';
import { useGridStateInit } from '../../utils/useGridStateInit';
import { GridRowIndex, GridColumnIndex, GridCellMeta } from './gridCellsMetaState';

const gridCellsMetaSelector = (state: GridState) => state.cellsMeta;

export const useGridCellsMeta = (apiRef: GridApiRef) => {
  useGridStateInit(apiRef, (state) => ({
    ...state,
    cellsMeta: {
      sizes: {},
    },
  }));

  const setCellMeta = React.useCallback(
    (rowIndex: GridRowIndex, columnIndex: GridColumnIndex, size: GridCellMeta) => {
      apiRef.current.setState((state) => {
        const { cellsMeta } = state;
        const { sizes } = cellsMeta;

        if (!sizes[rowIndex]) {
          sizes[rowIndex] = {};
        }

        sizes[rowIndex][columnIndex] = size;

        return {
          ...state,
          cellsMeta: {
            ...cellsMeta,
            sizes,
          },
        };
      });
    },
    [apiRef],
  );

  const getCellMeta = React.useCallback(
    (rowIndex: GridRowIndex, columnIndex: GridColumnIndex) => {
      const cellsMeta = gridCellsMetaSelector(apiRef.current.state);
      const { sizes } = cellsMeta;

      return sizes[rowIndex]?.[columnIndex];
    },
    [apiRef],
  );

  return {
    setCellMeta,
    getCellMeta,
  };
};
