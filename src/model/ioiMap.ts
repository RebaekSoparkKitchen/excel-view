import axios from 'axios';

const getIoiMap = async () => {
  const { data } = await axios.get('http://1.116.20.164/api/validator/ioi-map');
  return data;
};

export { getIoiMap };
