import Activation from '.';
import NDArray from '../../ndarray';
import Joi from 'joi';


/**
 * Inverse square root linear unit
 */
class ISRLU extends Activation
{
	public calculate( z : NDArray ) : NDArray
	{
		return z.apply(
			( val : number ) : number => {
				if( val < 0 )
				{
					// 1 / sqrt( 1 + alpha * x^2 )
					return 1.0 / Math.sqrt( 1.0 + this.params.alpha * Math.pow( val, 2 ) )
				}

				return val;
			}
		);
	}


	public getDescriptor() : object
	{
		return {
			alpha : Joi.number().optional().default( 0.0 ).description( 'Multiplier' )
		}
	}
}


export default ISRLU;
