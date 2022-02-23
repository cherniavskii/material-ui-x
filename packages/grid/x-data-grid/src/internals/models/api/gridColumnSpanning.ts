import {
  GridColumnIndex,
  GridCellMeta,
} from '@mui/x-data-grid/src/internals/models/gridColumnSpanning';
import { GridRowId } from '../gridRows';
/**
 * The Column Spanning API interface that is available in the grid `apiRef`.
 */
export interface GridColumnSpanning {
  /**
   * Returns the cell metadata with colSpan info.
   * @param {GridRowId} rowId The row id
   * @param {number} columnIndex The column index (0-based)
   * @returns {GridCellMeta|undefined} Cell metadata
   */
  unstable_getCellMeta: (
    rowId: GridRowId,
    columnIndex: GridColumnIndex,
  ) => GridCellMeta | undefined;
  /**
   * Calculate column spanning for each cell in the row
   * @param {Object} options The options to apply on the calculation.
   * @param {GridRowId} options.rowId The row id
   * @param {number} options.minFirstColumn First visible column index
   * @param {number} options.maxLastColumn Last visible column index
   */
  unstable_calculateColSpan: (options: {
    rowId: GridRowId;
    minFirstColumn: number;
    maxLastColumn: number;
  }) => void;
}
