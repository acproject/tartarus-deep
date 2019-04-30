import { Loss } from './loss';
import { Vector } from '../../math';

/**
 * Kullback Leibler Divergence
 */
export class KLDivergence extends Loss {
  public calculate(yHat: Vector, y: Vector): number {
    // ( sum( y * log( y ) ) / y.size ) - ( sum( y * log( yHat ) ) / y.size )
    const crossEntropy  = y.mul(yHat.log()).mean();
    const entropy       = y.mul(y.log()).mean();

    return entropy - crossEntropy;
  }
}

