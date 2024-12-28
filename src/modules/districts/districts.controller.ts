import { Controller, Get, Param } from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { Public } from 'src/decorator/customize';
import { District } from './schema/District.schema';
@Controller('districts')
@Public()
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}
  @Get('/:district_id/wards')
  async getWardsByDictrictId(
    @Param('district_id') districtId: string,
  ): Promise<District> {
    return await this.districtsService.getWardsByDictrictId(districtId);
  }
  @Get()
  async getAll(): Promise<District[]> {
    return await this.districtsService.getAll();
  }
}
