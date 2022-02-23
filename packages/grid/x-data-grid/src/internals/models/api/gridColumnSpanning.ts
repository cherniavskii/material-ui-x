import {
  GridColumnIndex,
  GridCellMeta,
} from '@mui/x-data-grid/src/internals/models/gridColumnSpanning';
import { GridRowId } from '../gridRows';
/**
 * The Column Spanning API interface that is available in the grid `apiRef`.
 */
export interface GridColumnSpanning {
  // TODO
  unstable_getCellMeta: (
    rowId: GridRowId,
    columnIndex: GridColumnIndex,
  ) => GridCellMeta | undefined;
  unstable_calculateColSpan: (params: {
    rowId: GridRowId;
    minFirstColumn: number;
    maxLastColumn: number;
  }) => void;
}
