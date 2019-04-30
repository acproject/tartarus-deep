import Joi from 'joi'; // Can't use JoiEx here -- circular dependency
import { Activation, ActivationDescriptor } from './activation';
import { NDArray } from '../../math';


/**
 * Rectified linear unit / leaky rectified linear unit / parameteric rectified linear unit
 */
export class ReLU extends Activation {
  public calculate(z: NDArray): NDArray {
    return z.apply((val: number): number => (val < 0 ? this.params.leak * val : val));
  }


  public getDescriptor(): ActivationDescriptor {
    return {
      leak: Joi.number().optional().default(0.0).description('Leak multiplier'),
    };
  }
}
