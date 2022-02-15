import React from 'react';
import { GridStateCommunity } from '../../../models/gridStateCommunity';
import { GridApiCommon } from '../../../models/api/gridApiCommon';
import { useGridStateInit } from '../../utils/useGridStateInit';
import { GridRowIndex, GridColumnIndex, GridCellMeta } from './gridCellsMetaState';

const gridCellsMetaSelector = (state: GridStateCommunity) => state.cellsMeta;

export const useGridCellsMeta = (apiRef: React.MutableRefObject<GridApiCommon>) => {
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
    (rowIndex: GridRowIndex, columnIndex: GridColumnIndex): GridCellMeta | undefined => {
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
