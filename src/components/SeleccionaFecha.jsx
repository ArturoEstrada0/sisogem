import React, { useState } from 'react';
import { DatePicker } from 'antd';
import './SesionesProgramadas.css'
const { RangePicker } = DatePicker;

const SeleccionaFecha = () => {
    const [dates, setDates] = useState(null);
    const [value, setValue] = useState(null);
    const disabledDate = (current) => {
        if (!dates) {
            return false;
        }
        const tooLate = dates[0] && current.diff(dates[0], 'days') >= 3;
        const tooEarly = dates[1] && dates[1].diff(current, 'days') >= 3;
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
        <RangePicker
            value={dates || value}
            disabledDate={disabledDate}
            onCalendarChange={(val) => {
                setDates(val);
            }}
            onChange={(val) => {
                setValue(val);
            }}
            onOpenChange={onOpenChange}
            changeOnBlur
        />
    );
};
export default SeleccionaFecha
    ;