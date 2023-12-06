import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button, Modal, Input, Space, Image, message } from "antd";
import {
  SearchOutlined,
  LeftOutlined,
  RightOutlined,
  UploadOutlined,
  SaveOutlined,
  EraserOutlined,
  FilePdfOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import AWS from "aws-sdk";

import SignatureCanvas from "react-signature-canvas";
import { PDFDocument } from "pdf-lib";
import { Rnd } from "react-rnd";
import "./PDFViewer.css";

// Configuración para el worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

async function insertSignatureIntoPdf(
  pdfFile,
  signatureImage,
  signatureCoordinates,
  signatureSize,
  pageNumber // Añadido parámetro para el número de página
) {
  try {
    console.log("Insertando firma en el PDF...");
    console.log("Coordenadas de la firma:", signatureCoordinates);

    const existingPdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const signatureImageBytes = await fetch(signatureImage).then((res) =>
      res.arrayBuffer()
    );
    const signatureImageEmbed = await pdfDoc.embedPng(signatureImageBytes);

    // Validación adicional para pageNumber
    if (typeof pageNumber !== "number" || isNaN(pageNumber)) {
      console.error("Número de página no válido o no definido.");
      return;
    }

    // Verifica que el número de página sea válido
    if (pageNumber < 1 || pageNumber > pdfDoc.getPageCount()) {
      console.error("Número de página inválido.");
      return;
    }

    // Obtener la página correcta basada en el número de página
    const page = pdfDoc.getPage(pageNumber - 1);

    const { height } = page.getSize();

    // Ajustar las coordenadas de la firma según el tamaño de la página
    page.drawImage(signatureImageEmbed, {
      x: signatureCoordinates.x,
      y: height - signatureCoordinates.y - signatureSize.height,
      width: signatureSize.width,
      height: signatureSize.height,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  } catch (error) {
    console.error("Error al insertar la firma en el PDF:", error);
  }
}

const resizerStyles = {
  bottomLeft: {
    background: "#e0919e",
    width: "15px",
    height: "15px",
    borderRadius: "10px",
  },
  bottomRight: {
    background: "#e0919e",
    width: "15px",
    height: "15px",
    borderRadius: "10px",
  },
  topLeft: {
    background: "#e0919e",
    width: "15px",
    height: "15px",
    borderRadius: "10px",
  },
  topRight: {
    background: "#e0919e",
    width: "15px",
    height: "15px",
    borderRadius: "10px",
  },
};

function SignaturePreview({ signatureImage, onResizeStop, onDragStop }) {
  return (
    <Rnd
      default={{
        x: 0,
        y: 0,
        width: 150,
        height: 50,
      }}
      onResizeStop={onResizeStop}
      onDragStop={onDragStop}
      resizeHandleStyles={resizerStyles}
      className="rnd-resizer"
    >
      <img
        src={signatureImage}
        alt="Firma"
        style={{ width: "100%", height: "100%" }}
      />
    </Rnd>
  );
}

function PDFViewer({ url, organismo, documentKey }) {
  console.log("organismo PDFViewer", organismo);
  const [pdfFile, setPdfFile] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);
  const [pageNumber, setPageNumber] = useState(1); // Página actual
  const [numPages, setNumPages] = useState(null); // Número total de páginas
  const [searchText, setSearchText] = useState("");
  const [matches, setMatches] = useState([]);
  const [searchIndex, setSearchIndex] = useState(0);
  const [pageRefs, setPageRefs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showCanvas, setShowCanvas] = useState(true);
  const [signaturePosition, setSignaturePosition] = useState(null);
  // Agrega un nuevo estado para el PDF firmado
  const [signedPdfFile, setSignedPdfFile] = useState(null);

  AWS.config.update({
    accessKeyId: "AKIASAHHYXZDGGYMQIEG",
    secretAccessKey: "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",
    region: "us-east-1",
  });

  useEffect(() => {
    if (url) {
      fetchPdf(url);
    }
  }, [url]);

  useEffect(() => {
    if (signedPdfFile) {
      const pdfUrl = URL.createObjectURL(signedPdfFile);
      window.open(pdfUrl, "_blank");
    }
  }, [signedPdfFile]); // Se activará cada vez que signedPdfFile cambie

  // Función para cargar PDF desde una URL
  const fetchPdf = async (pdfUrl) => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      setPdfFile(blob);
    } catch (error) {
      console.error("Error al cargar el PDF:", error);
    }
  };

  const uploadSignedPdfToS3 = async () => {
    if (!signedPdfFile) {
      console.error("No hay un PDF firmado para subir.");
      return;
    }

    const s3 = new AWS.S3();
    const params = {
      Bucket: organismo, // Reemplaza con el nombre de tu bucket
      Key: documentKey, // Reemplaza con la ruta del archivo en S3
      Body: signedPdfFile,
      ContentType: "application/pdf",
      ACL: "public-read", // Establecer el ACL como público
    };

    try {
      console.log("Nombre del bucket:", organismo);
      await s3.putObject(params).promise();
      console.log("PDF firmado subido con éxito.");
    } catch (error) {
      console.error("Error al subir el PDF a S3:", error);
    }
  };

  const onPdfClick = (event) => {
    if (!signatureImage || !pdfFile) return;

    const bounds = pdfWrapperRef.current.getBoundingClientRect();
    const scaleFactorWidth = bounds.width / 800; // Asume 800 como ancho original del PDF
    const scaleFactorHeight = bounds.height / 600; // Asume 600 como altura original del PDF

    const x = (event.clientX - bounds.left) / scaleFactorWidth;
    const y = (event.clientY - bounds.top) / scaleFactorHeight;

    setSignaturePosition({ x, y });
  };

  const applySignatureToPdf = async () => {
    if (!signatureImage || !signaturePosition || !pdfFile) return;

    try {
      // Convertir la firma en un Blob
      const response = await fetch(signatureImage);
      const blob = await response.blob();

      let existingPdfBytes;

      if (typeof pdfFile === "string" || pdfFile instanceof String) {
        // Si pdfFile es una URL, obtén el Blob desde la URL
        const response = await fetch(pdfFile);
        const pdfBlob = await response.blob();
        existingPdfBytes = await pdfBlob.arrayBuffer();
      } else {
        // Si pdfFile es un Blob o File
        existingPdfBytes = await pdfFile.arrayBuffer();
      }

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const signatureImg = await pdfDoc.embedPng(await blob.arrayBuffer());

      // Obtener la página y aplicar la imagen
      const page = pdfDoc.getPage(pageNumber - 1);
      const { width: pdfWidth, height: pdfHeight } = page.getSize();

      // Ajustar las coordenadas y el tamaño de la firma
      const x = signaturePosition.x;
      const y = pdfHeight - signaturePosition.y - signatureSize.height;

      console.log("Coordenadas de la firma:", signaturePosition);
      console.log("Tamaño de la firma:", signatureSize);

      page.drawImage(signatureImg, {
        x,
        y,
        width: signatureSize.width,
        height: signatureSize.height,
      });

      // Guardar el PDF y establecerlo en el estado
      const pdfBytes = await pdfDoc.save();
      console.log("PDF firmado generado.");
      setSignedPdfFile(new Blob([pdfBytes], { type: "application/pdf" }));
    } catch (error) {
      console.error("Error al aplicar la firma al PDF:", error);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  // Modificar handleOk para que guarde la firma y luego cierre el modal
  const handleOk = () => {
    if (showCanvas) {
      saveSignature();
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const toggleCanvas = () => {
    setShowCanvas(!showCanvas);
  };

  const fileInputRef = useRef(null);

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const searchInPdf = async () => {
    if (!pdfFile || !searchText.trim()) return;

    try {
      const reader = new FileReader();

      reader.onload = async () => {
        const buffer = reader.result;

        if (buffer) {
          const pdf = await pdfjs.getDocument({ data: buffer }).promise;
          const pdfPages = [];

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map((item) => item.str).join(" ");

            // Aquí se busca el texto en cada página y se agrega el número de página a pdfPages
            if (pageText.toLowerCase().includes(searchText.toLowerCase())) {
              pdfPages.push(i);
            }
          }

          // Actualiza el estado para reflejar los resultados de la búsqueda
          setMatches(pdfPages);
        }
      };

      reader.readAsArrayBuffer(pdfFile);
    } catch (error) {
      console.error("Error al buscar en el PDF:", error);
    }
  };

  const goToPage = (page) => {
    setPageNumber(page);
    if (pageRefs[page - 1] && pageRefs[page - 1].current) {
      pageRefs[page - 1].current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const [signatureCoordinates, setSignatureCoordinates] = useState({
    x: 0,
    y: 0,
  });
  const [signatureSize, setSignatureSize] = useState({
    width: 150,
    height: 50,
  });
  const pdfWrapperRef = useRef();
  let sigPad = useRef();

  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPdfFile(file);
      console.log("Archivo PDF cargado:", file.name);
    }
  };

  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const img = event.target.files[0];

      // Verifica que la imagen sea de tipo PNG
      if (!img.type || img.type.split("/")[1] !== "png") {
        message.error("Por favor, selecciona una imagen en formato PNG.");
        return;
      }

      setSignatureImage(URL.createObjectURL(img));
      console.log("Imagen de firma cargada:", img.name);
    }
  };

  const clearSignature = () => {
    sigPad.current.clear();
    console.log("Firma borrada.");
  };

  // Función para guardar la firma
  const saveSignature = () => {
    if (sigPad.current) {
      const image = sigPad.current.getTrimmedCanvas().toDataURL("image/png");
      setSignatureImage(image);
      console.log("Firma guardada.");
    }
  };

  const handlePdfClick = (event) => {
    const bounds = pdfWrapperRef.current.getBoundingClientRect();
    const pdfContainerWidth = bounds.width; // Ancho del contenedor del PDF
    const scaledPdfWidth = 800; // Ancho al que se escala el PDF dentro del contenedor

    // Calcular el factor de escala
    const scaleFactor = scaledPdfWidth / pdfContainerWidth;

    // Calcular las coordenadas ajustadas
    const x = (event.clientX - bounds.left) * scaleFactor;
    const y = (event.clientY - bounds.top) * scaleFactor;

    setSignatureCoordinates({ x, y });
    console.log("Coordenadas de clic ajustadas:", { x, y });
  };

  const handleResizeStop = (e, direction, ref, delta, position) => {
    setSignatureSize({
      width: parseInt(ref.style.width, 10),
      height: parseInt(ref.style.height, 10),
    });
    setSignatureCoordinates(position);
  };

  const handleDragStop = (e, d) => {
    setSignatureCoordinates({ x: d.x, y: d.y });
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageRefs(Array.from({ length: numPages }, () => React.createRef()));
  }

  function changePage(offset) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  function previousPage() {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  }

  function nextPage() {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  }

  return (
    <div>
      {/* Botones y controles de acción en una sola línea */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "10px",
        }}
      >
        <Button
          icon={<FilePdfOutlined />}
          type="primary"
          onClick={handleFileButtonClick}
          style={{ backgroundColor: "#6A0F49", borderColor: "#6A0F49" }}
        >
          Abrir PDF
        </Button>

        <input
          type="file"
          onChange={onFileChange}
          accept="application/pdf"
          hidden
          ref={fileInputRef}
        />

        {pdfFile && (
          <>
            <Button
              type="primary"
              onClick={showModal}
              icon={<FileImageOutlined />}
              style={{ backgroundColor: "#6A0F49", borderColor: "#6A0F49" }}
            >
              Abrir Firma
            </Button>

            <Space style={{ position: "relative", width: "fit-content" }}>
              <Input
                type="text"
                placeholder="Buscar en el PDF"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: 200, // Ajusta el ancho según tus necesidades
                  borderRadius: "5px",
                  border: "1px solid #6a0f49", // Borde con color similar al botón
                  paddingRight: "30px", // Aumenta el espacio a la derecha para el botón
                  marginBottom: 0, // Elimina el margen inferior para que esté más pegado al botón
                }}
              />
              <Button
                onClick={searchInPdf}
                icon={<SearchOutlined />}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "8px", // Alinea el botón hacia la derecha dentro del cuadro de texto
                  transform: "translateY(-50%)", // Centra verticalmente el botón
                  backgroundColor: "#6a0f49",
                  color: "#ffffff",
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  border: "none", // Elimina el borde del botón
                  padding: "4px 8px", // Ajusta el espacio interior del botón
                  fontSize: "14px", // Ajusta el tamaño del texto del botón
                }}
              ></Button>
            </Space>

            <div style={{ display: "flex", marginLeft: "-5px" }}>
              <Button
                disabled={pageNumber <= 1}
                onClick={previousPage}
                icon={<LeftOutlined />}
                style={{
                  backgroundColor: "#6a0f49",
                  color: "#ffffff",
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  marginRight: "5px", // Ajusta el margen derecho para separar los botones
                }}
              >
                Ant
              </Button>

              <Button
                disabled={pageNumber >= numPages}
                onClick={nextPage}
                icon={<RightOutlined />}
                style={{
                  backgroundColor: "#6a0f49",
                  color: "#ffffff",
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  marginLeft: "5px", // Ajusta el margen izquierdo para separar los botones
                  display: "flex",
                  flexDirection: "row-reverse", // Invierte el orden del contenido dentro del botón
                  alignItems: "center", // Centra verticalmente el texto y el ícono
                }}
              >
                Sig
              </Button>
            </div>

            <Button
              onClick={applySignatureToPdf}
              type="primary"
              style={{
                backgroundColor: "#6a0f49",
                color: "#ffffff",
                borderRadius: "5px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                marginRight: "10px", // Margen derecho para separar los botones
              }}
            >
              Aplicar Firma en el PDF
            </Button>

            <Button
              onClick={uploadSignedPdfToS3}
              type="primary"
              style={{
                backgroundColor: "#6a0f49", // Color de fondo
                color: "#ffffff", // Color del texto
                borderRadius: "5px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                padding: "8px 16px", // Ajusta el padding según tus preferencias
                display: "flex",
                alignItems: "center",
                justifyContent: "center", // Centra horizontalmente el contenido del botón
              }}
              icon={
                <img
                  src="/computacion-en-la-nube.png"
                  alt="Nombre de la imagen"
                  style={{
                    width: "20px",
                    height: "20px",
                    verticalAlign: "middle",
                  }}
                />
              } // Centra verticalmente la imagen
            ></Button>
          </>
        )}
      </div>

      {/* Modal para la firma */}
      {pdfFile && (
        <Modal
          title="Firma"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          width={600}
          style={{ borderRadius: "10px", textAlign: "center" }}
          okButtonProps={{
            style: {
              backgroundColor: "#701e45",
              color: "#fff",
              border: "1px solid #F1CDD3",
            },
          }}
          cancelButtonProps={{
            style: {
              backgroundColor: "#fff",
              color: "#701e45",
              border: "1px solid #701e45",
            },
          }}
        >
          {showCanvas ? (
            <div>
              <p style={{ fontSize: "16px", marginBottom: "10px" }}>
                Firma aquí:
              </p>
              <SignatureCanvas
                penColor="black"
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: "sigCanvas",
                  border: "1px solid #F1CDD3",
                }}
                ref={sigPad}
              />
              <Button
                onClick={clearSignature}
                style={{
                  marginTop: "10px",
                  backgroundColor: "#701e45",
                  color: "#fff",
                  border: "1px solid #F1CDD3",
                }}
              >
                Limpiar
              </Button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                onChange={onImageChange}
                accept="image/png" // Restringe la selección a archivos PNG
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  border: "2px dashed #F1CDD3",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                }}
              />
              {/* Previsualización de la imagen */}
              {signatureImage && (
                <Image
                  src={signatureImage}
                  alt="Previsualización de firma"
                  preview={false} // Desactiva la vista previa de la imagen
                  style={{ marginTop: "10px", width: "100%", height: "auto" }}
                />
              )}
            </div>
          )}

          <Button
            onClick={toggleCanvas}
            style={{
              marginTop: "10px",
              backgroundColor: "#701e45",
              color: "#fff",
              border: "1px solid #F1CDD3",
            }}
          >
            {showCanvas ? "Firmar con Imagen" : "Firmar con Trazo"}
          </Button>
        </Modal>
      )}

      {/* Renderizado del PDF */}
      <div
        ref={pdfWrapperRef}
        onClick={onPdfClick}
        style={{ cursor: "handwriting" }}
      >
        <div className="pdf-container">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div>Cargando PDF...</div>}
          >
            <Page
              key={`page_${pageNumber}`}
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>

        {/* Vista previa de la firma (fuera del modal y sobre el PDF) */}
        {signatureImage && (
          <SignaturePreview
            signatureImage={signatureImage}
            onResizeStop={(e, direction, ref, delta, position) => {
              setSignatureSize({
                width: ref.offsetWidth,
                height: ref.offsetHeight,
              });
              setSignatureCoordinates({ x: position.x, y: position.y });
            }}
            onDragStop={(e, d) => {
              setSignatureCoordinates({ x: d.x, y: d.y });
            }}
          />
        )}
      </div>

      {/* Resultados de la búsqueda y controles adicionales */}
      {matches.length > 0 && pdfFile && (
        <div>
          <p>Palabra encontrada en las páginas: </p>
          {matches.map((match, index) => (
            <button key={index} onClick={() => goToPage(match)}>
              Ir a la página {match}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PDFViewer;
