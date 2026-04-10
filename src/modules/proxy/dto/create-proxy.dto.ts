import { IsArray, IsNumber, IsString } from "class-validator";

export class CreateProxyDto {
    @IsArray({ message: "Danh sách truyền lên phải là 1 mảng" })
    @IsString({ each: true, message: "Proxy phải là string" })
    proxies: string[]

    @IsNumber()
    type: number
}
