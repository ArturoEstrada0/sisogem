import React, { useRef, useEffect } from "react";
import WebViewer from "@pdftron/webviewer";
import "./PDFTron.css";
import { uploadFileToS3 } from "../services/S3Service";
let instance = null;

async function initWebViewer(viewerElement) {
  try {
    instance = await WebViewer(
      {
        path: "/lib",
        initialDoc: "https://sisogem.s3.amazonaws.com/pruebaDesdePdf.pdf",
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

const PDFTron = () => {
  const viewer = useRef(null);

  useEffect(() => {
    if (viewer.current) {
      initWebViewer(viewer.current);
    }

    return () => {
      if (instance) {
        instance.UI.closeReaderControl();
        instance.UI.unloadResources();
      }
    };
  }, []);

  return (
    <div className="App">
      <div className="header"></div>
      <div className="webviewer-container" ref={viewer}></div>
    </div>
  );
};

export default PDFTron;
