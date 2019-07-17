import Joi from '@hapi/joi';
import { Matrix, Vector } from '../../math';
import { Parameterized, Parameters } from '../../generic';

export type OptimizerParams = Parameters;


export abstract class Optimizer<T extends OptimizerParams = OptimizerParams> extends Parameterized<T> {
  public abstract optimize<NType extends Matrix|Vector>(weights: NType, dLossOverDWeights: NType): NType;

  public getParamSchema(): Joi.Schema {
    return Joi.object();
  }
}
