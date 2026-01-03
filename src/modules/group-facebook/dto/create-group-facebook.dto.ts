import { IsString } from "class-validator";

export class CreateGroupFacebookDto {
    @IsString({ message: "Group phải là string" })
    name: string

    @IsString({ message: "GroupId phải là string" })
    groupId: string
}
