import React from 'react';

const GoogleDocumentViewer = () => {
    const documentURL = 'https://docs.google.com/document/d/11T4OyOHZG9M4_q1RhbQ0Npmh3vCnbC-jOmhQl74VEQo/edit?usp=sharing';
    return (
    <div>
      <iframe src={documentURL} width="100%" height="600px" />
    </div>
  );
};

export default GoogleDocumentViewer;
