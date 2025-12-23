import fs from 'fs';
import path from 'path';
import * as OpenApiValidator from 'express-openapi-validator';

const specPath = path.join(process.cwd(), 'spec', 'api.yaml');

if (!fs.existsSync(specPath)) {
  throw new Error(`Api spec not found at: ${specPath}`);
}

export const MainApiValidator = OpenApiValidator.middleware({
  apiSpec: specPath,
  validateRequests: true,
  validateResponses: false,
  validateSecurity: false,
  ignoreUndocumented: true,
  fileUploader: false,
  formats: [
    {
      name: 'bytes',
      type: 'string',
      validate: (a: any) => {
        return Buffer.from(a, 'base64').length > 0;
      },
    },
  ],
});
