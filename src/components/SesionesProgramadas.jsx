// SesionesProgramadas.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { DatePicker, Space } from 'antd';
import { FormControl, InputLabel, Select, MenuItem, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import SavedSessions from './SesionGuardada';

const { RangePicker } = DatePicker;

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
  const [value, setValue] = useState(0);
  const [sesionValue, setSesionValue] = useState('');
  const [dateValue, setDateValue] = useState(null);
  const [radioOption, setRadioOption] = useState('option1');
  const [savedSessions, setSavedSessions] = useState([]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleNumeroSesionChange = (event) => {
    setSesionValue(event.target.value);
  };

  const handleSelectDateChange = (value) => {
    setDateValue(value);
  };

  const handleRadioChange = (event) => {
    setRadioOption(event.target.value);
  };

  const handleDelete = (index) => {
    const updatedSessions = [...savedSessions];
    updatedSessions.splice(index, 1);
    setSavedSessions(updatedSessions);
  };

  const handleEnter = (index) => {
    console.log(`Entering session at index ${index}`);
  };

  const handleSave = () => {
    // Validaciones
    if (!sesionValue || !dateValue) {
      alert('Por favor, complete todos los campos antes de guardar la sesión.');
      return;
    }

    const newSession = {
      sesionValue,
      dateValue,
      radioOption,
    };

    setSavedSessions((prevSessions) => [...prevSessions, newSession]);

    setSesionValue('');
    setDateValue(null);
    setRadioOption('option1');
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
      <CustomTabPanel value={value} index={0} className="programar-sesion">
        <RadioGroup
          row
          aria-label="radio-options"
          name="radio-options"
          value={radioOption}
          onChange={handleRadioChange}
        >
          <FormControlLabel value="option1" control={<Radio />} label="Ordinaria" />
          <FormControlLabel value="option2" control={<Radio />} label="Extraordinaria" />
        </RadioGroup>
        <NumeroSesion
          value={sesionValue}
          onChange={handleNumeroSesionChange}
          radioOption={radioOption}
        />
        <SelectDate value={dateValue} onChange={handleSelectDateChange} onSave={handleSave} />
        <SeleccionaFecha />
        <Button variant="contained" onClick={() => handleSave(dateValue)} disabled={!sesionValue || !dateValue}>
          Guardar
        </Button>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <SavedSessions
          savedSessions={savedSessions}
          onDelete={handleDelete}
          onEnter={handleEnter}
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Sesión en Progreso
      </CustomTabPanel>
    </Box>
  );
}

export function NumeroSesion(props) {
  const { value, onChange, radioOption } = props;

  const getMenuItemText = (index) => {
    return radioOption === 'option1' ? `Sesión ${index}` : `Sesión ${index}`;
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Qué sesión es esta?</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value}
          label="Sesion"
          onChange={onChange}
        >
          {radioOption === 'option1' ? (
            Array.from({ length: 4 }, (_, index) => (
              <MenuItem key={index + 1} value={index + 1}>
                {getMenuItemText(index + 1)}
              </MenuItem>
            ))
          ) : (
            Array.from({ length: 20 }, (_, index) => (
              <MenuItem key={index + 1} value={index + 1}>
                {getMenuItemText(index + 1)}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>
    </Box>
  );
}

export function SelectDate(props) {
  const { value, onChange, onSave } = props;

  return (
    <Space direction="vertical">
      <PickerWithType type="time" value={value} onChange={onChange} onSave={onSave} />
    </Space>
  );
}

export function SeleccionaFecha() {
  const [dates, setDates] = useState(null);
  const [value, setValue] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const disabledDate = (current) => {
    if (!dates) {
      return false;
    }
    const tooLate = dates[0] && current.diff(dates[0], 'days') >= 2;
    const tooEarly = dates[1] && dates[1].diff(current, 'days') >= 2;
    return !!tooEarly || !!tooLate;
  };

  const onOpenChange = (open) => {
    if (open) {
      setDates([null, null]);
    } else {
      setDates(null);
    }
  };

  return (
    <div>
      <RangePicker
        value={dates || value}
        disabledDate={disabledDate}
        onCalendarChange={(val) => {
          setDates(val);
        }}
        onChange={(val) => {
          setValue(val);
          setSelectedDate(val && val.length > 0 ? val[0].format('YYYY-MM-DD') : null);
        }}
        onOpenChange={onOpenChange}
        changeOnBlur
      />
      <div style={{ marginTop: "10px" }}>
        {selectedDate && (
          <p>
            Fecha seleccionada: {selectedDate}
          </p>
        )}
      </div>
    </div>
  );
}

export function PickerWithType(props) {
  const { type, onChange, value, onSave } = props;

  return <DatePicker picker={type} value={value} onChange={onChange} onSave={onSave} />;
}
