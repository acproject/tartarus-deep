import { Layer, LayerDescriptor, LayerState } from './layer';
import { Activation } from '../activation';
import { JoiEx } from '../../util';
import { Matrix, NDArray, Vector } from '../../math';
import { Initializer } from '../initializer';

/* import { Initializer } from '../initializer';
import { Regularizer } from '../regularizer';
import { Constraint } from '../constraint'; */


export class Dense extends Layer {
  private weightInitializer?: Initializer;

  private biasInitializer?: Initializer;


  /* public units(units: number): Dense {
    return this.params.set('units', units) as Dense;
  }


  public activation(activation: string | Activation): Dense {
    return this.params.set('activation', activation) as Dense;
  }


  public bias(bias: boolean): Dense {
    return this.params.set('bias', bias) as Dense;
  } */


  /* NbiasInitializer(biasInitializer: Initializer | string | null): Dense {
    return <Dense>this.setParam('biasInitializer', biasInitializer);
  }


  biasRegularizer(biasRegularizer: Regularizer | string | null): Dense {
    return <Dense>this.setParam('biasRegularizer', biasRegularizer);
  }


  biasConstraint(biasConstraint: Constraint | string | null): Dense {
    return <Dense>this.setParam('biasConstraint', biasConstraint);
  }


  kernelInitializer(kernelInitializer: Initializer | string | null): Dense {
    return <Dense>this.setParam('kernelInitializer', kernelInitializer);
  }


  kernelRegularizer(kernelRegularizer: Regularizer | string | null): Dense {
    return <Dense>this.setParam('kernelRegularizer', kernelRegularizer);
  }


  kernelConstraint(kernelConstraint: Constraint | string | null): Dense {
    return <Dense>this.setParam('kernelConstraint', kernelConstraint);
  } */



  protected async forwardExec(): Promise<void> {
    const linearOutput    = this.calculate(this.input.get());
    const activatedOutput = this.activate(linearOutput);

    this.cache.set('linearOutput', linearOutput);
    this.cache.set('activatedOutput', activatedOutput);

    this.output.set(activatedOutput);
  }


  /**
   * Z = A_prev * W + b
   */
  protected calculate(input: NDArray): NDArray {
    // const input  = this.input.get();
    const weight = this.optimizer.getValue('weight') as Matrix;

    let output = weight.vecmul(new Vector(input.flatten()));

    if (this.params.bias) {
      output = output.add(this.optimizer.getValue('bias') as Vector) as Vector;
    }

    // this.output.set(output);
    return output;
  }


  /**
   * A = g(Z)
   */
  protected activate(linearOutput: NDArray): NDArray {
    const activation = this.params.activation as Activation;

    return activation.calculate(linearOutput);
  }


  public async compileExec(): Promise<void> {
    const inputUnits = this.input.size();
    const units = this.params.get('units');

    this.optimizer.declare('weight', [units, inputUnits]);
    this.output.declare([units, 1]);

    if (this.params.get('bias') === true) {
      this.optimizer.declare('bias', [units, 1]);
    }
  }


  protected async initializeExec(): Promise<void> {
    const wInit = this.params.get('weightInitializer') as Initializer;
    const weight = this.optimizer.get('weight');

    weight.set(wInit.initialize(new NDArray(...weight.getDims())));

    if (this.params.get('bias') === true) {
      const bInit = this.params.get('biasInitializer') as Initializer;
      const bias = this.optimizer.get('bias');

      bias.set(bInit.initialize(new NDArray(...bias.getDims())));
    }
  }


  public getDescriptor(): LayerDescriptor {
    return {
      units: JoiEx.number().default(16).min(1).description('Number of outputs'),
      activation: JoiEx.activation().default('identity').description('Activation function'),

      bias: JoiEx.boolean().default(true).description('Apply bias'),
      biasInitializer: JoiEx.initializer().default('zero').description('Bias initializer'),

      // biasRegularizer : JoiEx.regularizer().default( null ).description( 'Bias regularizer' ),
      // biasConstraint : JoiEx.constraint().default( null ).description( 'Bias constraint' ),

      weightInitializer: JoiEx.initializer().default('random-uniform').description('Weight initializer'),

      // kernelRegularizer : JoiEx.regularizer().default( 'l2' ).description( 'Kernel regularizer' ),
      // kernelConstraint : JoiEx.constraint().default( 'max-norm' ).description( 'Kernel constraint' ),

      // activityRegularizer : JoiEx.regularizer().default( 'l1' ).description( 'Activity regularizer' )
    };
  }
}
