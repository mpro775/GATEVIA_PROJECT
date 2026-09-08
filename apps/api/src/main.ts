import 'reflect-metadata';
import { Logger } from '@nestjs/common'; import { NestFactory } from '@nestjs/core'; import { AppModule } from './app.module'; import { configureApplication, setupOpenApi } from './bootstrap';
async function main(){const app=await NestFactory.create(AppModule,{bufferLogs:true});configureApplication(app);setupOpenApi(app);const port=Number(process.env.PORT??3002);await app.listen(port,'0.0.0.0');Logger.log(`API listening on ${port}`,'Bootstrap')}
void main();
