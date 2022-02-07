export type GridRowIndex = number;
export type GridColumnIndex = number;
export interface GridCellMeta {
  width?: number;
  spanned: boolean;
  nextCellIndex: GridColumnIndex;
  prevCellIndex: GridColumnIndex;
}

/**
 * Keeps cells size.
 */
export interface GridCellsMetaState {
  /**
   * The grid cells size.
   */
  sizes: Record<GridRowIndex, Record<GridColumnIndex, GridCellMeta>>;
}
