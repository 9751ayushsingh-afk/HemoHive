'use client';
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerModalProps {
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

const QrScannerModal: React.FC<QrScannerModalProps> = ({ onClose, onScanSuccess }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerId = "qr-reader";

  useEffect(() => {
    if (!scannerRef.current) {
      const scanner = new Html5Qrcode(readerId);
      scannerRef.current = scanner;

      const handleSuccess = (decodedText: string) => {
        onScanSuccess(decodedText);
      };

      const handleError = (errorMessage: string) => {
        // console.error(errorMessage);
      };

      scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleSuccess,
        handleError
      ).catch(err => {
        console.error("Unable to start scanning.", err);
      });
    }

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().then(() => {
          console.log("QR Code scanning stopped.");
        }).catch(err => {
          console.error("Failed to stop QR Code scanning.", err);
        });
      }
    };
  }, [onScanSuccess]);

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[600] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 rounded-lg p-8 w-full max-w-md flex flex-col items-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
        <div id={readerId} style={{ width: '100%' }}></div>
        <button onClick={onClose} className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
};

export default QrScannerModal;