import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { Public } from 'src/decorator/customize';
@Controller('districts')
@Public()
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}
  @Get('/:district_id/wards')
  getWardsByDictrictId(@Param('district_id') districtId :string){
    return this.districtsService.getWardsByDictrictId(districtId);
  }
  @Get()
  getAll(){
    return this.districtsService.getAll();
  }
}
