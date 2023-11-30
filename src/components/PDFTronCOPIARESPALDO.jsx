import React, { useRef, useEffect, useState } from "react";
import WebViewer from "@pdftron/webviewer";
import "./PDFTron.css";
import { uploadFileToS3 } from "../services/S3Service";

let instance = null;

async function initWebViewer(viewerElement, initialDoc) {
  try {
    console.log("Iniciando con el documento:", initialDoc);

    instance = await WebViewer(
      {
        path: "/lib",
        initialDoc,
        licenseKey:
          "1701035808221:7ca8949d03000000003741d9ae8751485cd810d85bc61209207d61be4c",
      },
      viewerElement
    );

    instance.UI.disableElements(["toolbarGroup-Shapes"]); // Quita la seccion de FORMAS
    instance.UI.disableElements(["toolbarGroup-Forms"]); // Quita la seccion Formularios
    instance.UI.disableElements([
      "rotateClockwiseButton",
      "rotateCounterClockwiseButton",
    ]); // Quita Rotación del documento
    instance.UI.disableElements(["toolbarGroup-Annotate"]); // Quita la seccion de Anotaciones
    instance.UI.disableElements(["toolbarGroup-Edit"]); // Quita la seccion de Editar
    instance.UI.disableElements(["toolbarGroup-FillAndSign"]); // Quita la seccion de Editar
    instance.UI.disableElements([
      "pageManipulationOverlayButton",
      "thumbDelete",
      "thumbRotateClockwise",
    ]); // Quita la seccion de Editar
    instance.UI.disableElements([
      "crossStampToolButton",
      "checkStampToolButton",
      "dotStampToolButton",
      "dateFreeTextToolButton",
    ]); // Quita botones de Cross, Tick, Dot y Calendar

    const { documentViewer, annotationManager, Annotations } = instance.Core;

    documentViewer.addEventListener("documentLoaded", () => {
      // Find existing text annotations
      const textAnnotations = annotationManager
        .getAnnotationsList()
        .filter((annot) => annot instanceof Annotations.FreeTextAnnotation);

      // Modify existing text annotations
      textAnnotations.forEach((textAnnot) => {
        textAnnot.setContents("Modified Text");
        annotationManager.redrawAnnotation(textAnnot);
      });
    });

    instance.UI.setHeaderItems((header) => {
      header.push({
        type: "actionButton",
        img: "/nube.png",
        onClick: async () => {
          // alert("Se envió");
          const doc = documentViewer.getDocument();
          const xfdfString = await annotationManager.exportAnnotations();
          const data = await doc.getFileData({ xfdfString });
          const arr = new Uint8Array(data);
          const blob = new Blob([arr], { type: "application/pdf" });
          uploadFileToS3(blob, "pruebaDesdePdf.pdf")
            .then((res) => {
              console.log(res);
            })
            .catch((err) => console.log(err));
        },
      });
    });
  } catch (error) {
    console.error("Error initializing WebViewer:", error);
  }
}

const PDFTron = ({ documentos }) => {
  const viewer = useRef(null);
  const [selectedDocumento, setSelectedDocumento] = useState(null);

  useEffect(() => {
    console.log("Archivos cargados:", documentos);

    if (viewer.current && documentos.length > 0) {
      const initialDoc = documentos[0].url;
      setSelectedDocumento(documentos[0]); // Establecer el primer documento como seleccionado
      initWebViewer(viewer.current, initialDoc);
    }

    return () => {
      if (instance) {
        instance.UI.closeReaderControl();
        instance.UI.unloadResources();
      }
    };
  }, [documentos]);

  useEffect(() => {
    console.log("Documento seleccionado:", selectedDocumento);
    if (instance && instance.Core && selectedDocumento) {
      console.log("Cargando nuevo documento:", selectedDocumento.url);
      const { documentViewer } = instance.Core;
      documentViewer.loadDocument(selectedDocumento.url);
    }
  }, [instance, selectedDocumento]);
  
  

  return (
    <div className="App">
      <div className="header">React sample</div>
      <div className="webviewer-container" ref={viewer}></div>
    </div>
  );
};

export default PDFTron;