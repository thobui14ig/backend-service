import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { AutoService } from "./auto.service";
import { IAutoSettingParam } from "./auto.entity";

@Controller('auto')
export class PageController {
    constructor(private readonly autoService: AutoService) { }

    @Get()
    getAll() {
        return this.autoService.getAll()
    }

    @Post()
    create(@Body() body: IAutoSettingParam) {
        return this.autoService.insert(body)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.autoService.remove(+id);
    }

    @Patch('/:id')
    update(@Body() body: IAutoSettingParam, @Param('id') id: number) {
        return this.autoService.update(+id, body)
    }
}