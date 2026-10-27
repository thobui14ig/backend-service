import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { EPlatform, LinkStatus } from "../entities/links.entity";
import { Optional } from "@nestjs/common";
import { Type } from "class-transformer";

class LinkDto {
  @IsString()
  // @Matches(/^https:\/\/www\.facebook\.com\//, {
  //   message: 'Nội dung phải bắt đầu bằng "https://www.facebook.com/"',
  // })
  @MinLength(1, { message: "Nội dung không được bỏ trống" })
  url: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Optional()
  delayTime?: number;
}

@ValidatorConstraint({ name: "isFacebookLinks", async: false })
class FacebookLinksConstraint implements ValidatorConstraintInterface {
  validate(links: LinkDto[], args: ValidationArguments): boolean {
    const request = args.object as { platform?: EPlatform };
    if (request.platform !== EPlatform.FACEBOOK) {
      return true;
    }

    return Array.isArray(links) && links.every((link) => {
      if (typeof link?.url !== "string") {
        return false;
      }

      try {
        const url = new URL(
          /^https?:\/\//i.test(link.url) ? link.url : `https://${link.url}`,
        );
        return (
          ["facebook.com", "www.facebook.com", "m.facebook.com"].includes(
            url.hostname.toLowerCase(),
          ) &&
          (url.protocol === "http:" || url.protocol === "https:") &&
          !url.username &&
          !url.password &&
          !url.port
        );
      } catch {
        return false;
      }
    });
  }

  defaultMessage(): string {
    return "Link Facebook phải thuộc facebook.com, www.facebook.com hoặc m.facebook.com";
  }
}

export class CreateLinkDTO {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  @Validate(FacebookLinksConstraint)
  links: LinkDto[];

  @IsNumber()
  groupId: number;

  @IsEnum(LinkStatus)
  status: LinkStatus;

  @IsEnum(EPlatform)
  platform: EPlatform;
}
