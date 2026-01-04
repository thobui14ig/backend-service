import { IsNumber } from "class-validator";

export class CreateOrderDto {
    @IsNumber()
    amount: number
}

export class ConfirmDto {
    @IsNumber()
    orderId: number
}