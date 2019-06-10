import { Layer, LayerParams } from './layer';
import { Activation } from '../activation';
import { JoiEx, JoiExSchema } from '../../util';
import { Matrix, NDArray, Vector } from '../../math';
import { Initializer } from '../initializer';
import { KeyNotFoundError } from '../../error';


export interface DenseParamsInput extends LayerParams {
  units: number;
  activation?: Activation|string;
  bias?: boolean;
  biasInitializer?: Initializer|string;
  weightInitializer?: Initializer|string;
}

export interface DenseParamsCoerced extends DenseParamsInput {
  activation: Activation;
  biasInitializer: Initializer;
  weightInitializer: Initializer;
}


export class Dense extends Layer<DenseParamsInput, DenseParamsCoerced> {
  protected static readonly WEIGHT_MATRIX = 'weight';

  protected static readonly BIAS_MATRIX = 'bias';

  protected static readonly LINEAR_OUTPUT = 'linear';

  protected static readonly ACTIVATED_OUTPUT = 'activated';


  protected derivative(a: NDArray, z: NDArray, y?: NDArray): NDArray {
    return this.params.activation.derivative(a, z, y);
  }


  /**
   * @link https://www.youtube.com/watch?v=x_Eamf8MHwU
   */
  protected async backwardExec(): Promise<void> {
    const derivativeOutput  = this.derivative(
      this.output.getValue(Dense.ACTIVATED_OUTPUT),
      this.output.getValue(Dense.LINEAR_OUTPUT),
      // this.train.getValue(Layer.EXPECTED_OUTPUT, true),
    );

    const weights = new Matrix(this.optimizer.getValue(Dense.WEIGHT_MATRIX));
    const dNext = new Vector(this.backpropInput.getValue(Layer.DERIVATIVE));

    // (weights)T dNext .* g'(z)
    const dCurrent = weights.transpose().vecmul(dNext).mul(derivativeOutput).flatten();

    this.backpropOutput.setValue(Layer.DERIVATIVE, dCurrent);
    this.backpropOutput.setValue(Layer.LOSS, this.backpropInput.getValue(Layer.LOSS));
  }


  protected async forwardExec(): Promise<void> {
    const linearOutput      = this.calculate(this.input.getDefault().get());
    const activatedOutput   = this.activate(linearOutput);

    this.output.setValue(Dense.LINEAR_OUTPUT, linearOutput);
    this.output.setValue(Dense.ACTIVATED_OUTPUT, activatedOutput);
  }


  /**
   * Z = A_prev * W + b
   */
  protected calculate(input: NDArray): NDArray {
    const weight = new Matrix(this.optimizer.getValue(Dense.WEIGHT_MATRIX));

    let output = weight.vecmul(new Vector(input.flatten()));

    if (this.params.bias) {
      output = output.add(new Vector(this.optimizer.getValue(Dense.BIAS_MATRIX))) as Vector;
    }

    return output;
  }


  /**
   * A = g(Z)
   */
  protected activate(linearOutput: NDArray): NDArray {
    const activation = this.params.activation as Activation;

    return activation.calculate(linearOutput);
  }


  protected resolveBackpropInput(): void {
    if (this.rawBackpropInputs.count() < 1) {
      throw new Error(`Missing backprop input for dense layer '${this.getName()}'`);
    }

    // This needs rewriting to deal with cases where a layer has multiple outputs
    // This needs rewriting to deal with bias, not just weight
    try {
      const defaultInput = this.rawBackpropInputs.getDefault();

      this.backpropInput.setCollection(defaultInput);
      return;
    } catch (err) {
      if (!(err instanceof KeyNotFoundError)) {
        throw err;
      }
    }

    if (this.rawBackpropInputs.count() < 1) {
      throw new Error(`Missing input for dense layer '${this.getName()}'`);
    }

    if (this.rawBackpropInputs.count() > 1) {
      // throw new Error(`Too many inputs for a dense layer '${this.getName()}'`);
      // DO SOMETHING
    }

    this.backpropInput.setCollection(this.rawBackpropInputs.first());
  }


  protected resolveInput(): void {
    try {
      const defaultInput = this.rawInputs.getDefault();

      this.input.setCollection(defaultInput);
      return;
    } catch (err) {
      if (!(err instanceof KeyNotFoundError)) {
        throw err;
      }
    }

    if (this.rawInputs.count() < 1) {
      throw new Error(`Missing input for dense layer '${this.getName()}'`);
    }

    if (this.rawInputs.count() > 1) {
      throw new Error(`Too many inputs for a dense layer '${this.getName()}'`);
    }

    this.input.setCollection(this.rawInputs.first());
  }


  protected async compileForwardPropagation(): Promise<void> {
    this.resolveInput();

    this.input.requireDefault();

    const inputUnits = this.input.getDefault().countElements();
    const units = this.params.units;

    this.optimizer.declare(Dense.WEIGHT_MATRIX, [units, inputUnits]);

    if (this.params.bias) {
      this.optimizer.declare(Dense.BIAS_MATRIX, [units]);
    }

    this.output.declare(Dense.LINEAR_OUTPUT, [units]);
    this.output.declare(Dense.ACTIVATED_OUTPUT, [units]);

    this.output.setDefaultKey(Dense.ACTIVATED_OUTPUT);
  }


  protected async compileBackPropagation(): Promise<void> {
    this.resolveBackpropInput();

    this.backpropInput.require(Layer.DERIVATIVE);
    this.backpropInput.require(Layer.LOSS);

    const inputUnits = this.input.getDefault().countElements(); // input is correct

    this.backpropOutput.declare(Layer.DERIVATIVE, inputUnits);
    this.backpropOutput.declare(Layer.LOSS, 1);
  }


  protected async initializeExec(): Promise<void> {
    const wInit = this.params.weightInitializer;
    const weight = this.optimizer.get(Dense.WEIGHT_MATRIX);

    weight.set(await wInit.initialize(new NDArray(...weight.getDims())));

    if (this.params.bias) {
      const bInit = this.params.biasInitializer;
      const bias = this.optimizer.get(Dense.BIAS_MATRIX);

      bias.set(await bInit.initialize(new NDArray(...bias.getDims())));
    }
  }


  public getParamSchema(): JoiExSchema {
    return JoiEx.object().keys(
      {
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
      },
    );
  }
}
