import Joi from 'joi';
import _ from 'lodash';

import { ClassManager } from './class-manager';

import * as activations from '../nn/activation';
import * as costs from '../nn/cost';
// import * as layers from '../nn/layer'; // -- this will cause circular dependencies
import * as losses from '../nn/loss';
import * as initializers from '../nn/initializer';
import * as randomizers from '../math/randomizer';


/* eslint-disable @typescript-eslint/no-explicit-any, no-underscore-dangle */

function createCMExtension(name: string, cm: ClassManager): Function {
  return (joi: any) => (
    {
      name,
      base: joi.any(),
      language: {
        coerceFailure: 'Unexpected data type passed to the coerce function',
      },
      coerce(value: any, state: any, options: any): any {
        try {
          return cm.coerce(value || _.get(this, '_flags.default'), _.get(this, '_flags.layer'));
        } catch (e) {
          return (this as any).createError(`${name}.coerceFailure`, {}, state, options);
        }
      },
      rules: [
        {
          name: 'layer',
          setup(params: any) {
            (this as any)._flags.layer = params.layer;
          },
          params: {
            layer: joi.any().required(),
          },
          validate(params: any, value: any, state: any, options: any) {
            if (!value.attachLayer) {
              return (this as any).createError('`{name}`.layerMissing', {}, state, options);
            }

            return value;
          },
        },
      ],
    }
  );
}


type InitializerLayer = (layer: any) => Joi.AnySchema;

interface InitializerSchema extends Joi.AnySchema {
  layer: InitializerLayer;
}


/* eslint-disable @typescript-eslint/no-namespace */
declare namespace ExtendedJoi {
  export function activation(): Joi.AnySchema;
  export function cost(): Joi.AnySchema;
  export function initializer(): InitializerSchema;
  export function loss(): Joi.AnySchema;
  export function randomizer(): Joi.AnySchema;
}


function joify(customJoi: typeof Joi): (typeof Joi & typeof ExtendedJoi) {
  return customJoi as any;
}


const customJoi = joify(Joi.extend(
  [
    createCMExtension('activation', new ClassManager(activations, activations.Activation)),
    createCMExtension('cost', new ClassManager(costs, costs.Cost)),
    // createCMExtension( 'constraint', new ClassManager( constraints, constraints.Constraint ) ),
    createCMExtension('initializer', new ClassManager(initializers, initializers.Initializer)),

    // createCMExtension( 'layer', new ClassManager( layers, layers.Layer ) ), // -- this will cause circular dependencies

    createCMExtension('loss', new ClassManager(losses, losses.Loss)),
    createCMExtension('randomizer', new ClassManager(randomizers, randomizers.Randomizer)),

    // createCMExtension( 'regularizer', new ClassManager( regularizers, regularizers.Regularizer ) )
  ],
));

export { customJoi as JoiEx };
export type JoiExSchema = Joi.Schema;

