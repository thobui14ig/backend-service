import { IsString } from "class-validator";

export class CreateGroupDto {
    @IsString({ message: "Group phải là string" })
    name: string
}
