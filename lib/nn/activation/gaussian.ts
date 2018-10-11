import { Activation } from './activation';
import { NDArray } from '../../math/ndarray';


/**
 * Gaussian
 */
export class Gaussian extends Activation
{
	public calculate( z : NDArray ) : NDArray
	{
		return z.pow( 2 ).neg().exp();
	}
}

