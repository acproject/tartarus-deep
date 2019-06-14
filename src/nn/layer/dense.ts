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
  public static readonly WEIGHT_MATRIX = 'weight';

  public static readonly BIAS_VECTOR = 'bias';

  public static readonly LINEAR_OUTPUT = 'linear';

  public static readonly ACTIVATED_OUTPUT = 'activated';


  protected derivative(a: NDArray, z: NDArray, y?: NDArray): NDArray {
    return this.params.activation.derivative(a, z, y);
  }


  /**
   * @link https://www.youtube.com/watch?v=x_Eamf8MHwU
   */
  protected async backwardExec(): Promise<void> {
    this.calculateDerivative();
  }


  protected calculateLayerErrorFromLabel(): NDArray {
    const yHat = new Vector(this.output.getDefaultValue());
    const y = new Vector(this.train.getDefaultValue());

    // layerError = (a - y) = (yHat - y) = -(y - yHat) = dErrorTotal / dOutput
    return yHat.sub(y);
  }


  protected calculateLayerErrorFromChain(): NDArray {
    const y = this.train.hasDefaultValue() ? this.train.getDefaultValue() : undefined;
    const layerErrorNext = new Vector(this.backpropInput.getValue(Layer.DERIVATIVE));
    const weightNext = new Matrix(this.backpropInput.getValue(Dense.WEIGHT_MATRIX));
    const activated = this.output.getValue(Dense.ACTIVATED_OUTPUT);
    const linear = this.output.getValue(Dense.LINEAR_OUTPUT);
    const derivativeOutput  = this.derivative(activated, linear, y);

    // layerError = (wNext)T dNext .* g'(z)
    return weightNext.transpose().vecmul(layerErrorNext).mul(derivativeOutput);
  }


  protected calculateDerivative(): void {
    const layerError = this.train.hasDefaultValue() ? this.calculateLayerErrorFromLabel() : this.calculateLayerErrorFromChain();

    this.backpropOutput.setValue(Layer.DERIVATIVE, layerError);
    this.backpropOutput.setValue(Dense.WEIGHT_MATRIX, this.optimizer.getValue(Dense.WEIGHT_MATRIX));

    // const dLinearOverDWeight = this.input.getDefaultValue();
    // const dETotalOverWeight = layerError.mul(dLinearOverDWeight);
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
      const bias = this.optimizer.getValue(Dense.BIAS_VECTOR).getAt([0]);

      output = output.add(bias) as Vector;
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
    // This needs rewriting to deal with cases where a layer has multiple outputs
    // This needs rewriting to deal with bias, not just weight
    try {
      this.backpropInput.setCollection(this.rawBackpropInputs.getDefault());
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
      this.optimizer.declare(Dense.BIAS_VECTOR, 1);
    }

    this.output.declare(Dense.LINEAR_OUTPUT, [units]);
    this.output.declare(Dense.ACTIVATED_OUTPUT, [units]);

    this.output.setDefaultKey(Dense.ACTIVATED_OUTPUT);
  }


  protected async compileBackPropagation(): Promise<void> {
    // const inputUnits = this.input.getDefault().countElements(); // input is correct
    this.train.setCollection(this.rawTrainingLabels.getDefault());

    if (this.rawBackpropInputs.count() === 0) {
      const trainColl  = this.train.getCollection();

      trainColl.declare(Layer.TRAINING_LABEL, this.params.units);
      trainColl.setDefaultKey(Layer.TRAINING_LABEL);
    } else {
      this.resolveBackpropInput();

      this.backpropInput.require(Layer.DERIVATIVE);
      this.backpropInput.require(Dense.WEIGHT_MATRIX);
    }

    this.backpropOutput.declare(Layer.DERIVATIVE, this.params.units);
    this.backpropOutput.declare(Dense.WEIGHT_MATRIX, this.optimizer.get(Dense.WEIGHT_MATRIX).getDims());
  }


  protected async initializeExec(): Promise<void> {
    const wInit = this.params.weightInitializer;
    const weight = this.optimizer.get(Dense.WEIGHT_MATRIX);

    weight.set(await wInit.initialize(new NDArray(...weight.getDims())));

    if (this.params.bias) {
      const bInit = this.params.biasInitializer;
      const bias = this.optimizer.get(Dense.BIAS_VECTOR);

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
