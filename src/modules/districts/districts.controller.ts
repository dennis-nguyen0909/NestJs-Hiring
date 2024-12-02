import { Controller, Get, Param } from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { Public } from 'src/decorator/customize';
@Controller('districts')
@Public()
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}
  @Get('/:district_id/wards')
  async getWardsByDictrictId(@Param('district_id') districtId: string) {
    return await this.districtsService.getWardsByDictrictId(districtId);
  }
  @Get()
  async getAll() {
    return await this.districtsService.getAll();
  }
}
