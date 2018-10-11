import { Loss } from './loss';
import { Vector } from '../../math/vector';

/**
 * Mean Absolute Error
 */
export class MeanAbsoluteError extends Loss
{
	calculate( yHat : Vector, y : Vector ) : number
	{
		// sum( abs( yHat - y ) ) / y.size
		return yHat.sub( y ).abs().mean();
	}
}

