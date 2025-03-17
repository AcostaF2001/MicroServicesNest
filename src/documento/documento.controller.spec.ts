import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoController } from './documento.controller';
import { DocumentoService } from './documento.service';

describe('DocumentoController', () => {
  let controller: DocumentoController;
  let mockDocumentoService: Partial<DocumentoService>;

  beforeEach(async () => {
    // ✅ 1. Crear un mock del servicio
    mockDocumentoService = {
      convertDocxToHtml: jest.fn(),
      replaceVariables: jest.fn(),
      generatePDF: jest.fn(),
    };

    // ✅ 2. Configurar el módulo de prueba con el servicio mock
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentoController],
      providers: [
        {
          provide: DocumentoService,
          useValue: mockDocumentoService,
        },
      ],
    }).compile();

    // ✅ 3. Obtener la instancia del controlador
    controller = module.get<DocumentoController>(DocumentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});