import {
  GridColumnIndex,
  GridCellMeta,
} from '@mui/x-data-grid/src/internals/models/gridCellsColSpan';
import { GridRowId } from '../gridRows';
/**
 * The Cells Meta API interface that is available in the grid `apiRef`.
 */
export interface GridCellsColSpan {
  // TODO
  unstable_getCellSize: (
    rowId: GridRowId,
    columnIndex: GridColumnIndex,
  ) => GridCellMeta | undefined;
  unstable_calculateRowColSpan: (params: {
    rowId: GridRowId;
    minFirstColumn: number;
    maxLastColumn: number;
  }) => void;
}
