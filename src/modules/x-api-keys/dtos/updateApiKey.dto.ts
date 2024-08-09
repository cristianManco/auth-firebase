import { PartialType } from '@nestjs/swagger';
import { CreateApiKeyDto } from './createApiKey.dto';

export class UpdateApiKeyDto extends PartialType(CreateApiKeyDto) {
  readonly isActive?: boolean;
}
