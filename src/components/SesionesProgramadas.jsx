import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ProgramarSesion from './ProgramarSesion';
import NumeroSesion from './NumeroSesion';
import SelectDate from './SelectDate';
import SeleccionaFecha from './SeleccionaFecha';
import ButtonProgramar from './ButtonProgramar';
import './SesionesProgramadas.css';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function SesionesProgramadas() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Programar Sesión" {...a11yProps(0)} />
          <Tab label="Sesiones Programadas" {...a11yProps(1)} />
          <Tab label="Sesión en Progreso" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0} className='programar-sesion'>
        <ProgramarSesion />
        <NumeroSesion />
        <SelectDate />
        <SeleccionaFecha />
        <ButtonProgramar />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        Sesiones Programadas
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Sesión en Progreso
      </CustomTabPanel>
    </Box>
  );
}
