import { Module } from '@nestjs/common';
import { DocumentoController } from './documento.controller';
import { DocumentoService } from './documento.service';


@Module({
  controllers: [DocumentoController],
  providers: [DocumentoService], // ✅ Asegurar que está registrado como provider
  exports: [DocumentoService], // ✅ Exportar para ser utilizado en otros módulos
})
export class DocumentoModule {}
