import * as React from 'react';
import {
  DataGridPremium,
  useGridApiRef,
  unstable_useGridPivoting,
  Unstable_GridPivotModel as PivotModel,
  Unstable_GridPivotModelEditor as GridPivotModelEditor,
} from '@mui/x-data-grid-premium';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useMovieData } from '@mui/x-data-grid-generator';

export default function GridPivotingMovies() {
  const apiRef = useGridApiRef();

  const movieData = useMovieData();
  const data = React.useMemo(() => {
    return {
      ...movieData,
      columns: [...movieData.columns, { field: 'imdbRating', type: 'number' }],
    };
  }, [movieData]);
  const [pivotModel, setPivotModel] = React.useState<PivotModel>({
    rows: ['company'],
    columns: [
      { field: 'year', sort: 'desc' },
      { field: 'cinematicUniverse', sort: 'asc' },
      { field: 'director', sort: 'asc' },
    ],
    values: [
      { field: 'gross', aggFunc: 'sum' },
      { field: 'imdbRating', aggFunc: 'avg' },
    ],
  });

  const { isPivot, setIsPivot, props } = unstable_useGridPivoting({
    rows: data.rows,
    columns: data.columns,
    pivotModel,
    apiRef,
    initialIsPivot: true,
  });

  return (
    <div style={{ width: '100%' }}>
      <FormControlLabel
        control={
          <Switch checked={isPivot} onChange={(e) => setIsPivot(e.target.checked)} />
        }
        label="Pivot"
      />
      <GridPivotModelEditor
        columns={data.columns}
        pivotModel={pivotModel}
        onPivotModelChange={setPivotModel}
      />
      <div style={{ height: isPivot ? undefined : 400, width: '100%' }}>
        <DataGridPremium
          key={isPivot.toString()}
          {...props}
          apiRef={apiRef}
          experimentalFeatures={{ columnGrouping: true }}
          autoHeight={isPivot}
        />
      </div>
    </div>
  );
}
