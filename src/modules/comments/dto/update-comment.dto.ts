import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create-comment.dto';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../entities/comment.entity';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
    @IsNumber()
    id: number

    @IsEnum(OrderStatus)
    orderStatus: OrderStatus

    @IsString()
    @IsNotEmpty()
    address: string

    @IsString()
    @IsOptional()
    note: string
}
