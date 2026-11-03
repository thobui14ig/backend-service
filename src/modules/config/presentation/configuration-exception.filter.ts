import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import {
  ConfigurationNotFoundError,
  UserNotFoundError,
} from '../application/configuration.errors';

@Catch(ConfigurationNotFoundError, UserNotFoundError)
export class ConfigurationExceptionFilter implements ExceptionFilter {
  catch(
    exception: ConfigurationNotFoundError | UserNotFoundError,
    host: ArgumentsHost,
  ) {
    const response = host.switchToHttp().getResponse();
    response.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: exception.message,
      error: 'Not Found',
    });
  }
}
