import {
    Controller, Post, UploadedFile, Res, Body, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentoService } from './documento.service';
import { Response } from 'express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import * as multer from 'multer';
import * as path from 'path'; // ✅ Importar path para manejar nombres de archivo
import { UploadDocumentDto } from './upload-document.dto';
import { Express } from 'express';


@ApiTags('Documento')
@Controller('documento')
export class DocumentoController {
    constructor(private readonly documentoService: DocumentoService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
    @ApiOperation({ summary: 'Sube un archivo .docx y genera un PDF con variables reemplazadas' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Archivo Word (.docx)',
                },
                variables: {
                    type: 'object',
                    example: {
                        NOMBRE: "Juan Pérez",
                        FECHA: "14 de marzo de 2025",
                        IMAGEN_URL: "<img src='https://example.com/imagen.jpg' />"
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'PDF generado correctamente.', content: { 'application/pdf': {} } })
    @ApiResponse({ status: 500, description: 'Error al procesar el archivo' })
    async uploadDocxAndGeneratePDF(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: { variables: Record<string, string> },
        @Res() res: Response
    ) {
        try {
            if (!file) {
                return res.status(400).json({ message: 'No se subió ningún archivo' });
            }

            console.log('📥 Archivo recibido:', file.originalname);
            const uploadDir = './uploads';
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

            const tempPath = `${uploadDir}/document.docx`;
            fs.writeFileSync(tempPath, file.buffer);

            console.log("📤 Variables recibidas en el controller:", body.variables);

            // 📌 Modificar el DOCX y convertirlo a PDF
            const pdfBuffer = await this.documentoService.processDocxToPdf(tempPath, body.variables);

            // Eliminar el archivo temporal
            fs.unlinkSync(tempPath);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=document.pdf',
            });

            return res.send(pdfBuffer);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al procesar el archivo' });
        }
    }
}

