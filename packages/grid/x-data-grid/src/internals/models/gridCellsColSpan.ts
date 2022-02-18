export type GridColumnIndex = number;

export interface GridCellMeta {
  width?: number;
  spanned: boolean;
  nextCellIndex: GridColumnIndex;
  prevCellIndex: GridColumnIndex;
  cellProps: {
    colSpan?: number;
    width?: number;
    other?: Record<string, any>;
  };
}
