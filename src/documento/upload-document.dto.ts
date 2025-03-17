import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class UploadDocumentDto {
    @ApiProperty({
        description: 'Variables dinámicas para reemplazar en el documento',
        example: {
            NOMBRE: "Juan Pérez",
            FECHA: "14 de marzo de 2025",
            IMAGEN_URL: "<img src='https://example.com/imagen.jpg' />"
        },
    })
    @IsObject()
    variables: Record<string, string>;
}
