import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function NumeroSesion() {
  const [age, setAge] = React.useState('');

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Qué sesión es esta?</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={age}
          label="Sesion"
          onChange={handleChange}
        >
          <MenuItem value={10}>Primera</MenuItem>
          <MenuItem value={20}>Segunda</MenuItem>
          <MenuItem value={30}>Tercera</MenuItem>
          <MenuItem value={30}>Cuarta</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
