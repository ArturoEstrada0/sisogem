import React, { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button, Modal, Input, Space } from "antd";
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

function PDFViewer() {
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

      // Crear un nuevo documento PDF con la firma aplicada
      const existingPdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const signatureImg = await pdfDoc.embedPng(await blob.arrayBuffer());

      // Obtener la página y aplicar la imagen
      const page = pdfDoc.getPage(pageNumber - 1);
      const { width: pdfWidth, height: pdfHeight } = page.getSize();

      // Ajustar las coordenadas según el tamaño de la firma y el centro de la imagen
      const adjustedX = signaturePosition.x - signatureSize.width / 2;

      // Ajustar la coordenada Y para centrar la firma correctamente
      const adjustedY = signaturePosition.y - signatureSize.height / 2;

      // Asegurar que las coordenadas estén dentro de los límites del PDF
      const x = Math.max(
        0,
        Math.min(adjustedX, pdfWidth - signatureSize.width)
      );
      const y = Math.max(
        0,
        Math.min(adjustedY, pdfHeight - signatureSize.height)
      );

      // Invertir la coordenada Y para que sea relativa al borde superior de la página
      const invertedY = pdfHeight - y - signatureSize.height;

      page.drawImage(signatureImg, {
        x,
        y: invertedY,
        width: signatureSize.width,
        height: signatureSize.height,
      });

      // Guardar el PDF y abrirlo en una nueva ventana
      const pdfBytes = await pdfDoc.save();
      const newPdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
      const newPdfUrl = URL.createObjectURL(newPdfBlob);
      window.open(newPdfUrl, "_blank");
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
      let img = event.target.files[0];
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginBottom: "10px" }}>
        <Button
          icon={<FilePdfOutlined />}
          type="primary"
          onClick={handleFileButtonClick}
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
            >
              Abrir Firma
            </Button>
  
            <Space>
              <Input
                type="text"
                placeholder="Buscar en el PDF"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }} // Ajusta el ancho según tus necesidades
              />
              <Button onClick={searchInPdf} icon={<SearchOutlined />}>
                Buscar
              </Button>
            </Space>
  
            <Button
              disabled={pageNumber <= 1}
              onClick={previousPage}
              icon={<LeftOutlined />}
            >
              Anterior
            </Button>
            <Button
              disabled={pageNumber >= numPages}
              onClick={nextPage}
              icon={<RightOutlined />}
            >
              Siguiente
            </Button>
  
            <Button onClick={applySignatureToPdf}>Aplicar Firma en el PDF</Button>
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
        >
          {showCanvas ? (
            <div>
              <p>Firma aquí:</p>
              <SignatureCanvas
                penColor="black"
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: "sigCanvas",
                }}
                ref={sigPad}
              />
              <Button onClick={clearSignature}>Limpiar</Button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                onChange={onImageChange}
                accept="image/*"
              />
            </div>
          )}
  
          <Button onClick={toggleCanvas}>
            {showCanvas ? "Cambiar a Subir Imagen" : "Cambiar a Firma en Canvas"}
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
          <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
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
