import { BadRequestException } from '@nestjs/common';
import Ajv, { Schema } from 'ajv';
import addFormats from 'ajv-formats';
import ValidationError from 'ajv/dist/runtime/validation_error';

export function validateSchema(schema: Schema, data: any) {
  const ajv = new Ajv({ strict: false });
  addFormats(ajv);
  if (!ajv.validate(schema, data)) {
    throw new BadRequestException(new ValidationError(ajv.errors));
  }
}
