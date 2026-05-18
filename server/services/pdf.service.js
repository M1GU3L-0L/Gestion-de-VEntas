const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  generarFactura(venta, cliente, vendedor) {
    return new Promise((resolve, reject) => {
      try {
        // Crear documento PDF
        const doc = new PDFDocument({ margin: 50 });
        
        // Nombre del archivo
        const fileName = `Factura-${venta.numeroFactura}.pdf`;
        const filePath = path.join(__dirname, '../uploads', fileName);
        
        // Stream para guardar el archivo
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
        
        // Encabezado
        doc.fontSize(20)
           .text('FACTURA DE VENTA', { align: 'center' })
           .moveDown();
        
        // Información de la empresa
        doc.fontSize(10)
           .text('Sistema de Gestión de Ventas', { align: 'center' })
           .text('NIT: 123456789-0', { align: 'center' })
           .text('Tel: (601) 1234567', { align: 'center' })
           .moveDown();
        
        // Línea separadora
        doc.moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke()
           .moveDown();
        
        // Información de la factura
        const infoY = doc.y;
        doc.fontSize(10)
           .text(`Factura No: ${venta.numeroFactura}`, 50, infoY)
           .text(`Fecha: ${new Date(venta.createdAt).toLocaleDateString('es-CO')}`, 50, infoY + 15)
           .text(`Vendedor: ${vendedor.nombre}`, 50, infoY + 30);
        
        // Información del cliente
        doc.text(`Cliente: ${cliente.nombre}`, 300, infoY)
           .text(`Cédula: ${cliente.cedula}`, 300, infoY + 15)
           .text(`Teléfono: ${cliente.telefono}`, 300, infoY + 30)
           .text(`Email: ${cliente.email}`, 300, infoY + 45);
        
        doc.moveDown(3);
        
        // Línea separadora
        doc.moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke()
           .moveDown();
        
        // Encabezado de tabla
        const tableTop = doc.y;
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('Código', 50, tableTop)
           .text('Descripción', 120, tableTop)
           .text('Cant.', 320, tableTop)
           .text('Precio Unit.', 380, tableTop)
           .text('Subtotal', 480, tableTop);
        
        // Línea debajo del encabezado
        doc.moveTo(50, tableTop + 15)
           .lineTo(550, tableTop + 15)
           .stroke();
        
        // Items de la venta
        let y = tableTop + 25;
        doc.font('Helvetica');
        
        venta.items.forEach(item => {
          doc.fontSize(9)
             .text(item.codigo, 50, y)
             .text(item.nombre.substring(0, 30), 120, y)
             .text(item.cantidad.toString(), 330, y)
             .text(`$${item.precioUnitario.toFixed(2)}`, 380, y)
             .text(`$${item.subtotal.toFixed(2)}`, 480, y);
          y += 20;
        });
        
        // Línea antes de totales
        doc.moveDown();
        doc.moveTo(50, y + 10)
           .lineTo(550, y + 10)
           .stroke();
        
        y += 25;
        
        // Totales
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('Subtotal:', 380, y)
           .text(`$${venta.subtotal.toFixed(2)}`, 480, y);
        
        if (venta.impuesto > 0) {
          y += 20;
          doc.text('Impuesto (19%):', 380, y)
             .text(`$${venta.impuesto.toFixed(2)}`, 480, y);
        }
        
        y += 20;
        doc.fontSize(12)
           .text('TOTAL:', 380, y)
           .text(`$${venta.total.toFixed(2)}`, 480, y);
        
        // Método de pago
        y += 30;
        doc.fontSize(10)
           .font('Helvetica')
           .text(`Método de pago: ${venta.metodoPago}`, 50, y);
        
        // Pie de página
        doc.fontSize(8)
           .text('Gracias por su compra', 50, 700, { align: 'center' })
           .text('Esta es una factura generada electrónicamente', { align: 'center' });
        
        // Finalizar documento
        doc.end();
        
        stream.on('finish', () => {
          resolve({ fileName, filePath });
        });
        
        stream.on('error', (error) => {
          reject(error);
        });
        
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new PDFService();