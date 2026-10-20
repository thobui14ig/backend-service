import { IsNumber } from "class-validator";

export class CreateOrderDto {
    @IsNumber()
    amount: number
}

export class ConfirmDto {
    @IsNumber()
    orderId: number
}

export class BuyVipDto {
    @IsNumber()
    planId: number
}

export class BidvConfirm {
    content: string
    code: string
    amount: string;
}

export class BidvConfirmRefactor {
    userId: number
    code: string
    amount: number;
}