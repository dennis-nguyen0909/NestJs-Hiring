import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { Currency } from './schema/currencies.schema';

export interface ICurrenciesService {
  create(data: CreateCurrencyDto): Promise<Currency>;
  findAll(query: string, current: number, pageSize: number): Promise<any>;
  findOne(id: string): Promise<Currency>;
  update(id: string, updateLevelDto: UpdateCurrencyDto): Promise<Currency>;
  remove(ids: Array<string>): Promise<any>;
}
