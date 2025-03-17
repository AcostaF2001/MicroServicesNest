import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as libre from 'libreoffice-convert';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
const ImageModule = require('docxtemplater-image-module-free');
import * as path from 'path'; // 🔥 Importa path


@Injectable()
export class DocumentoService {
    /**
         * 📝 Modifica el DOCX con las variables y lo convierte en PDF
         * @param filePath Ruta del archivo DOCX
         * @param variables Variables a reemplazar
         * @returns Buffer con el PDF generado
         */
    async processDocxToPdf(filePath: string, variables: Record<string, string>): Promise<Buffer> {
        // 1️⃣ Modificar el archivo DOCX con variables
        const modifiedDocxPath = await this.replaceVariablesInDocx(filePath, variables);

        // 2️⃣ Convertir DOCX a PDF
        const pdfBuffer = await this.convertDocxToPdf(modifiedDocxPath);

        // 3️⃣ Eliminar el archivo modificado
        fs.unlinkSync(modifiedDocxPath);

        return pdfBuffer;
    }

    /**
     * 📄 Reemplaza variables dentro del archivo DOCX
     * @param filePath Ruta del archivo DOCX
     * @param variables Variables a reemplazar
     * @returns Ruta del nuevo archivo modificado
     */
    async replaceVariablesInDocx(filePath: string, variables: Record<string, string>): Promise<string> {
        try {

            console.log("📥 Variables recibidas en replaceVariablesInDocx:", variables);
            console.log("📊 Tipo de datos de variables:", typeof variables);

            if (typeof variables === "string") {
                console.log("🛠 Convirtiendo variables de string a objeto JSON...");
                variables = JSON.parse(variables);
            }

            const content = fs.readFileSync(filePath, 'binary');
            const zip = new PizZip(content);

            // 📌 Configurar módulo de imágenes
            const imageModule = new ImageModule({
                centered: true, // Centrar imagen
                getImage: (tagValue) => {
                    console.log("🖼 Cargando imagen desde:", tagValue);
                    return fs.readFileSync(tagValue); // Leer imagen correctamente
                },
                getSize: () => [300, 150], // Tamaño en píxeles
            });


            const doc = new Docxtemplater(zip, {
                modules: [imageModule], // Usar el módulo de imágenes
                paragraphLoop: true,
                linebreaks: true,
                delimiters: { start: '<<', end: '>>' },
                nullGetter: () => ''
            });


            // // ✅ Convertir la ruta relativa a absoluta
            // let imagePath = path.resolve(__dirname, './uploads/LOGO1.png');

            // // 📌 Verificar si la imagen local existe
            // if (!fs.existsSync(imagePath)) {
            //     throw new Error(`❌ La imagen local no existe en la ruta: ${imagePath}`);
            // }
            // console.log("📁 Usando imagen local:", imagePath);

            // 🔹 Mapear las variables recibidas a las etiquetas en el Word
            const mappedVariables = {
                N: variables.NOMBRE || '',
                F: variables.FECHA || ''
            };

            console.log("🔄 Variables mapeadas:", mappedVariables);

            // 📌 Intentar reemplazar variables
            doc.render(mappedVariables);

            // 📌 Guardar archivo modificado
            const outputPath = filePath.replace('.docx', '-modified.docx');
            const buffer = doc.getZip().generate({ type: 'nodebuffer' });
            fs.writeFileSync(outputPath, buffer);

            console.log('✔ DOCX modificado y guardado en:', outputPath);
            return outputPath;
        } catch (error) {
            console.error('❌ Error al procesar la plantilla DOCX:', error);

            if (error.properties && error.properties.errors) {
                error.properties.errors.forEach((err: any) => {
                    console.error('⛔ Error en plantilla:', err);

                    // 📌 Si hay errores de etiquetas duplicadas, intentar ignorarlos
                    if (err.id === "duplicate_open_tag" || err.id === "duplicate_close_tag") {
                        console.warn("⚠ Ignorando error de etiqueta duplicada:", err.xtag);
                    }
                });
            }

            throw new Error(`Error en la plantilla DOCX: ${error.message}`);
        }
    }

    /**
     * 📄 Convierte DOCX a PDF usando LibreOffice
     * @param filePath Ruta del archivo DOCX
     * @returns Buffer con el PDF
     */
    async convertDocxToPdf(filePath: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            const fileBuffer = fs.readFileSync(filePath);
            libre.convert(fileBuffer, '.pdf', undefined, (err, pdfBuffer) => {
                if (err) {
                    reject(`❌ Error en conversión: ${err}`);
                } else {
                    resolve(pdfBuffer);
                }
            });
        });
    }
}    
