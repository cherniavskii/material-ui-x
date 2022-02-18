export type GridColumnIndex = number;

export type GridCellMeta =
  | {
      collapsedByColSpan: true;
      rightVisibleCellIndex: GridColumnIndex;
      leftVisibleCellIndex: GridColumnIndex;
    }
  | {
      collapsedByColSpan: false;
      cellProps: {
        colSpan: number;
        width: number;
        other?: Record<string, any>;
      };
    };
