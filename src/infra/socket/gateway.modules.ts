import { Global, Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';

@Global()
@Module({
    imports: [],
    providers: [AppGateway],
    controllers: [],
    exports: [AppGateway],
})
export class GatewayModules { }