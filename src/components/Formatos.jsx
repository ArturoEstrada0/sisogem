import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Button,
  Space,
  Modal,
  Dropdown,
  Menu,
  Pagination,
  Card,
  Empty,
} from "antd";
import {
  FileAddOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  uploadFileToS3,
  downloadFileFromS3,
  listObjectsInS3Bucket,
} from "../services/S3Service";
import { UserRoleContext } from "../context/UserRoleContext";
import { s3 } from "../services/AWSConfig";

const FormatosMenu = () => {
  const [objectList, setObjectList] = useState([]);
  const [deleteFileName, setDeleteFileName] = useState("");
  const fileInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { currentUser } = useContext(UserRoleContext);



const uploadFileToS3 = (file) => {
  const params = {
    Bucket: "sisogem",
    Key: file.name,
    Body: file,
    ContentType: file.type,
    ACL: "public-read", // Establecer el ACL como público
  };

  try {
    return s3.upload(params).promise();
  } catch (error) {
    console.error("Error en uploadFileToS3:", error);
    throw error;
  }
};


  useEffect(() => {
    listS3Objects();
  }, [currentPage]);

  const listS3Objects = async () => {
    try {
      const objects = await listObjectsInS3Bucket("sisogem");
      setObjectList(objects);
    } catch (error) {
      console.error("Error al listar objetos de S3:", error);
    }
  };

  const handleFileUpload = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    try {
      await uploadFileToS3(file);
      listS3Objects();
    } catch (error) {
      console.error("Error al subir el archivo:", error);
    }
  };

  const handleFileDownload = async (fileName) => {
    try {
      const blob = await downloadFileFromS3(fileName);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
    }
  };

  const showDeleteConfirm = (fileName) => {
    setDeleteFileName(fileName);
    Modal.confirm({
      title: "Confirmar eliminación",
      content: `¿Seguro que deseas eliminar el archivo "${fileName}"?`,
      okText: "Sí",
      okType: "danger",
      cancelText: "No",
      onOk: () => handleFileDelete(fileName),
      onCancel: () => setDeleteFileName(""),
    });
  };

  const handleFileDelete = async (fileName) => {
    try {
      const updatedObjectList = objectList.filter(
        (object) => object.Key !== fileName
      );
      setObjectList(updatedObjectList);
      setDeleteFileName("");
    } catch (error) {
      console.error("Error al eliminar el archivo:", error);
    }
  };

  const menu = (fileName, userRole) => (
    <Menu>
      <Menu.Item
        key="1"
        icon={<DownloadOutlined />}
        onClick={() => handleFileDownload(fileName)}
        style={{ color: "#1890ff" }}
      >
        Descargar
      </Menu.Item>
      {userRole === "ADMIN" && (
        <Menu.Item
          key="2"
          icon={<DeleteOutlined />}
          onClick={() => showDeleteConfirm(fileName)}
          style={{ color: "#701e45" }}
        >
          Eliminar
        </Menu.Item>
      )}
    </Menu>
  );

  const itemsPerPage = 8;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedObjects = objectList.slice(startIndex, endIndex);

  return (
    <div>
      <h2>Formatos editables</h2>
      <Card
        title="Documentos"
        style={{
          width: "80%",
          margin: "auto",
          height: "400px",
          overflowY: "auto",
        }}
      >
        {objectList.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No hay documentos"
          />
        ) : (
          <Space size={20} wrap style={{ justifyContent: "center" }}>
            {displayedObjects.map((object, index) => (
              <Dropdown
                key={index}
                overlay={menu(object.Key, currentUser?.roles)}
                trigger={["hover"]}
              >
                <div style={{ position: "relative" }}>
                  <Button
                    icon={
                      <FileAddOutlined
                        style={{ fontSize: "50px", alignSelf: "center" }}
                      />
                    }
                    size="large"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "220px",
                      height: "120px",
                      borderColor: "#6A0F49",
                      color: "#6A0F49",
                      overflow: "hidden",
                      whiteSpace: "normal",
                    }}
                  >
                    {object.Key}
                  </Button>
                </div>
              </Dropdown>
            ))}
          </Space>
        )}
      </Card>
      {currentUser?.rol.rol === "Comisario" && (
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
            ref={fileInputRef}
          />
          <Button
            type="primary"
            style={{
              backgroundColor: "#701e45",
              color: "#ffffff",
              borderRadius: "5px",
            }}
            onClick={handleFileUpload}
          >
            Subir Archivo
          </Button>
        </div>
      )}
      {deleteFileName && (
        <div style={{ marginTop: "20px" }}>
          <Button
            type="danger"
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(deleteFileName)}
          >
            Eliminar
          </Button>
        </div>
      )}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Pagination
          current={currentPage}
          total={objectList.length}
          onChange={(page) => setCurrentPage(page)}
          pageSize={itemsPerPage}
          showSizeChanger={false}
          showQuickJumper
        />
      </div>
    </div>
  );
};

export default FormatosMenu;
