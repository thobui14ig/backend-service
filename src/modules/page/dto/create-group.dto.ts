import { IsNumber, IsString } from "class-validator";

export class CreatePageDto {
    @IsString({ message: "PageId phải là string" })
    pageId: string

    @IsString({ message: "Name phải là string" })
    name: string
}
