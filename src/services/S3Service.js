import { s3 } from './AWSConfig';

export const uploadFileToS3 = (file) => {
  const params = {
    Bucket: 'sisogem',
    Key: file.name,
    Body: file,
    ContentType: file.type,
  };

  return s3.upload(params).promise();
};

export const downloadFileFromS3 = async (fileName) => {
  const params = {
    Bucket: 'sisogem',
    Key: fileName,
  };

  try {
    const data = await s3.getObject(params).promise();
    const blob = new Blob([data.Body], { type: data.ContentType });
    return blob;
  } catch (error) {
    throw new Error(`Error al descargar el archivo: ${error.message}`);
  }
};

export const listObjectsInS3Bucket = async (bucketName) => {
  const params = {
    Bucket: bucketName,
  };

  try {
    const data = await s3.listObjects(params).promise();
    return data.Contents;
  } catch (error) {
    throw new Error(`Error al listar objetos en el bucket: ${error.message}`);
  }
};
