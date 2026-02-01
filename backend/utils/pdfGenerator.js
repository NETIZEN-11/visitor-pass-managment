const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate visitor pass PDF
exports.generatePassPDF = async (passData, qrCodeDataURL) => {
  return new Promise((resolve, reject) => {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../uploads/passes');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `pass_${passData.passNumber}_${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, fileName);

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc.fontSize(24)
         .fillColor('#2196F3')
         .text('VISITOR PASS', { align: 'center' })
         .moveDown();

      // Pass Number
      doc.fontSize(16)
         .fillColor('#333')
         .text(`Pass #: ${passData.passNumber}`, { align: 'center' })
         .moveDown(2);

      // Visitor Details
      doc.fontSize(12)
         .fillColor('#666')
         .text('VISITOR INFORMATION', { underline: true })
         .moveDown(0.5);

      doc.fontSize(11)
         .fillColor('#333')
         .text(`Name: ${passData.visitorName}`)
         .text(`Email: ${passData.visitorEmail}`)
         .text(`Phone: ${passData.visitorPhone}`)
         .text(`Company: ${passData.visitorCompany || 'N/A'}`)
         .moveDown();

      // Visit Details
      doc.fontSize(12)
         .fillColor('#666')
         .text('VISIT DETAILS', { underline: true })
         .moveDown(0.5);

      doc.fontSize(11)
         .fillColor('#333')
         .text(`Host: ${passData.hostName}`)
         .text(`Purpose: ${passData.purpose}`)
         .text(`Valid From: ${new Date(passData.validFrom).toLocaleString()}`)
         .text(`Valid Until: ${new Date(passData.validUntil).toLocaleString()}`)
         .moveDown(2);

      // QR Code
      if (qrCodeDataURL) {
        const qrImage = qrCodeDataURL.split(',')[1];
        const qrBuffer = Buffer.from(qrImage, 'base64');
        doc.image(qrBuffer, {
          fit: [200, 200],
          align: 'center'
        });
      }

      // Footer
      doc.moveDown(2)
         .fontSize(10)
         .fillColor('#999')
         .text('Please present this pass at the security desk', { align: 'center' })
         .text('This pass is non-transferable', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(`/uploads/passes/${fileName}`);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};
