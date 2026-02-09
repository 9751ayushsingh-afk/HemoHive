declare module 'react-qr-scanner' {
    import * as React from 'react';

    export interface QrReaderProps {
        delay?: number | false;
        onError?: (error: any) => void;
        onScan?: (data: any) => void;
        style?: React.CSSProperties;
        facingMode?: 'user' | 'environment';
        legacyMode?: boolean;
        maxImageSize?: number;
        className?: string;
        constraints?: any; // Add constraints prop
    }

    export default class QrReader extends React.Component<QrReaderProps> { }
}
