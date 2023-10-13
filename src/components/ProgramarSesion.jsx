import * as React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import './SesionesProgramadas.css'

export default function ProgramarSesion() {
  return (
    <FormControl>
      <FormLabel id="demo-row-radio-buttons-group-label">Tipo de Sesión</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
      >
        <FormControlLabel value="ordinaria" control={<Radio className="radio-ordinaria" />} label="Ordinaria" />
        <FormControlLabel value="extraordinaria" control={<Radio className="radio-extraordinaria" />} label="Extraordinaria" />
      </RadioGroup>
    </FormControl>
  );
}
