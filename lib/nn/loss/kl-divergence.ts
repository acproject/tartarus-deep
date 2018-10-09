import Loss from './';
import Vector from '../../vector';

/**
 * Kullback Leibler Divergence
 */
class KLDivergence extends Loss
{
	calculate( yHat : Vector, y : Vector ) : number
	{
		// ( sum( y * log( y ) ) / y.size ) - ( sum( y * log( yHat ) ) / y.size )
		const crossEntropy = y.mul( yHat.log() ).mean(),
			entropy = y.mul( y.log() ).mean();

		return entropy - crossEntropy;
	}
}


export default KLDivergence;
