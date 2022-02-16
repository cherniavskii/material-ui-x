export type GridColumnIndex = number;

export interface GridCellMeta {
  width?: number;
  spanned: boolean;
  nextCellIndex: GridColumnIndex;
  prevCellIndex: GridColumnIndex;
}
