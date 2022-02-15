import { GridCellParams } from '../params/gridCellParams';
import { GridRowIndex, GridColumnIndex, GridCellMeta } from '../gridCellsColSpan';
/**
 * The Cells Meta API interface that is available in the grid `apiRef`.
 */
export interface GridCellsColSpan {
  // TODO
  unstable_calculateCellSize: (params: {
    columnIndex: number;
    rowIndex: number;
    cellParams: GridCellParams;
  }) => { colSpan: number; width: number };
  // TODO
  unstable_getCellSize: (
    rowIndex: GridRowIndex,
    columnIndex: GridColumnIndex,
  ) => GridCellMeta | undefined;
}
