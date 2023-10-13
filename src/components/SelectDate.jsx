import { DatePicker, Space } from 'antd';
import './SesionesProgramadas.css'

const PickerWithType = ({ type, onChange }) => {
  return <DatePicker picker={type} onChange={onChange} />;
};

const SelectDate = () => {
  return (
    <Space direction='vertical'>
      <PickerWithType type='time' onChange={(value) => console.log(value)} />
    </Space>
  );
};
export default SelectDate;