const QRCode = require('qrcode');

exports.generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(data), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
};

exports.verifyQRData = (data) => {
  try {
    const parsed = JSON.parse(data);
    return {
      valid: true,
      data: parsed
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid QR code data'
    };
  }
};
