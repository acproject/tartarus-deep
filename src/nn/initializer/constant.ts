import Joi from 'joi';
import { Initializer, InitializerDescriptor } from './initializer';
import { NDArray } from '../../math';


export class Constant extends Initializer {
  public async initialize(data: NDArray): Promise<NDArray> {
    return data.set(this.params.value);
  }


  public getDescriptor(): InitializerDescriptor {
    return {
      value: Joi.number().default(0.0).description('Constant value to initialize to'),
    };
  }
}
