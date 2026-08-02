import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateUserTiktokDto {
    @IsString({ message: "Nickname phải là string" })
    nickname: string

    @IsString({ message: "Name phải là string" })
    name: string

    // @IsBoolean()
    // @IsOptional()
    // isActive: boolean
}
