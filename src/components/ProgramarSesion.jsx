import * as React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

export default function ProgramarSesion() {
  const radioStyle = {
    color: '#F1CDD3', // Cambia 'blue' al color que desees
  };

  return (
    <FormControl>
      <FormLabel id="demo-row-radio-buttons-group-label">Tipo de Sesión</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
      >
        <FormControlLabel value="ordinaria" control={<Radio style={radioStyle} />} label="Ordinaria" />
        <FormControlLabel value="extraordinaria" control={<Radio style={radioStyle} />} label="Extraordinaria" />
      </RadioGroup>
    </FormControl>
  );
}

