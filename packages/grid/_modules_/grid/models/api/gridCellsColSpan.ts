import { GridCellParams } from '../params/gridCellParams';
import { GridColumnIndex, GridCellMeta } from '../gridCellsColSpan';
import { GridRowId } from '../gridRows';
import { GridStateColDef } from '../colDef/gridColDef';
import { GridApiCommunity } from './gridApiCommunity';
/**
 * The Cells Meta API interface that is available in the grid `apiRef`.
 */
export interface GridCellsColSpan {
  // TODO
  unstable_calculateCellSize: (params: {
    columnIndex: number;
    rowId: GridRowId;
    cellParams: GridCellParams;
    renderedColumns: GridStateColDef<GridApiCommunity>[];
  }) => { colSpan: number; width: number };
  // TODO
  unstable_getCellSize: (
    rowId: GridRowId,
    columnIndex: GridColumnIndex,
  ) => GridCellMeta | undefined;
}
