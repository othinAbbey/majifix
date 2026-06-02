import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingOverlay = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(255,255,255,0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}
    >
      <div className="text-center">
        <Spinner animation="border" />
        <div className="mt-3">
          Loading...
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;