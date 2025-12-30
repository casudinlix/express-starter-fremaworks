import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const moduleName = args[0];

if (!moduleName) {
  console.error('Please provide a module name (e.g., pnpm make:controller product)');
  process.exit(1);
}

const toPascalCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
};

const toCamelCase = (str: string) => {
  return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
};

const pascalName = toPascalCase(moduleName);
const camelName = toCamelCase(moduleName);
const lowerName = moduleName.toLowerCase();

const paths = {
  interfaceDir: path.join(__dirname, `../src/domain/interfaces/${lowerName}`),
  repositoryDir: path.join(__dirname, `../src/domain/repositories/${lowerName}`),
  serviceDir: path.join(__dirname, '../src/application/services'),
  controllerDir: path.join(__dirname, '../src/presentation/controllers'),
};

const files = {
  interface: {
    path: path.join(paths.interfaceDir, `${lowerName}.interface.ts`),
    content: `export interface I${pascalName} {
  id: string;
  name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface I${pascalName}Create {
  name: string;
  description?: string;
}

export interface I${pascalName}Update {
  name?: string;
  description?: string;
}
`,
  },
  repository: {
    path: path.join(paths.repositoryDir, `${lowerName}.repository.ts`),
    content: `import { BaseRepository } from '../base.repository';
import { I${pascalName} } from '../../interfaces/${lowerName}/${lowerName}.interface';

export class ${pascalName}Repository extends BaseRepository<I${pascalName}> {
  constructor() {
    super('${lowerName}s'); // Assuming table name is plural
  }
}
`,
  },
  service: {
    path: path.join(paths.serviceDir, `${lowerName}.service.ts`),
    content: `import { ${pascalName}Repository } from '../../domain/repositories/${lowerName}/${lowerName}.repository';
import { I${pascalName}Create, I${pascalName}Update } from '../../domain/interfaces/${lowerName}/${lowerName}.interface';
import { NotFoundError } from '../../shared/errors/AppError';

export class ${pascalName}Service {
  private static repository = new ${pascalName}Repository();

  static async findAll() {
    return await this.repository.findAll();
  }

  static async findById(id: string) {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundError('${pascalName} not found');
    return item;
  }

  static async create(data: I${pascalName}Create) {
    return await this.repository.create(data);
  }

  static async update(id: string, data: I${pascalName}Update) {
    const item = await this.findById(id);
    return await this.repository.updateById(item.id, data);
  }

  static async delete(id: string) {
    const item = await this.findById(id);
    return await this.repository.deleteById(item.id);
  }
}
`,
  },
  controller: {
    path: path.join(paths.controllerDir, `${lowerName}.controller.ts`),
    content: `import { Request, Response, NextFunction } from 'express';
import { ${pascalName}Service } from '../../application/services/${lowerName}.service';
import { ResponseFormatter } from '../../shared/utils/responseFormatter';

export class ${pascalName}Controller {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ${pascalName}Service.findAll();
      ResponseFormatter.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async show(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await ${pascalName}Service.findById(id);
      ResponseFormatter.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ${pascalName}Service.create(req.body);
      ResponseFormatter.created(res, data, '${pascalName} created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await ${pascalName}Service.update(id, req.body);
      ResponseFormatter.success(res, data, '${pascalName} updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ${pascalName}Service.delete(id);
      ResponseFormatter.success(res, null, '${pascalName} deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
`,
  },
};

// Create directories and files
const createDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
};

const createFile = (filePath: string, content: string) => {
  if (fs.existsSync(filePath)) {
    console.warn(`Skipped: ${filePath} (already exists)`);
  } else {
    fs.writeFileSync(filePath, content);
    console.log(`Created file: ${filePath}`);
  }
};

console.log(`Scaffolding module: ${pascalName}...`);

createDir(paths.interfaceDir);
createDir(paths.repositoryDir);
createDir(paths.serviceDir);
createDir(paths.controllerDir);

createFile(files.interface.path, files.interface.content);
createFile(files.repository.path, files.repository.content);
createFile(files.service.path, files.service.content);
createFile(files.controller.path, files.controller.content);

console.log("Done! Don't forget to register your routes.");
