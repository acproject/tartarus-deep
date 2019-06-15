import { Dense, Layer, Model } from '../../src/nn';
import { Matrix, Vector } from '../../src/math';

/**
 * @link https://www.anotsorandomwalk.com/backpropagation-example-with-numbers-step-by-step/
 */
describe(
  'Dense Model with Known (Precalculated) Data 2',
  () => {
    const m = new Model();
    const h = new Dense({ units: 2, activation: 'sigmoid' }, 'hidden');
    const o = new Dense({ units: 2, activation: 'sigmoid' }, 'output');

    it(
      'should declare and compile a model',
      async () => {
        m.input(3)
          .push(h)
          .push(o);

        await m.compile();
        await m.initialize();
      },
    );


    it(
      'should perform forward pass',
      async () => {
        h.data.optimizer.setValue(Dense.WEIGHT_MATRIX, new Matrix([[0.1, 0.3, 0.5], [0.2, 0.4, 0.6]]));
        h.data.optimizer.setValue(Dense.BIAS_VECTOR, new Vector([0.5]));

        o.data.optimizer.setValue(Dense.WEIGHT_MATRIX, new Matrix([[0.7, 0.9], [0.8, 0.1]]));
        o.data.optimizer.setValue(Dense.BIAS_VECTOR, new Vector([0.5]));

        await m.predict([1, 4, 5]);

        const hOut = h.data.output.getDefaultValue();
        const oOut = o.data.output.getDefaultValue();

        hOut.getAt([0]).should.be.closeTo(0.9866, 0.0001);
        hOut.getAt([1]).should.be.closeTo(0.9950, 0.0001);

        oOut.getAt([0]).should.be.closeTo(0.8896, 0.0001);
        oOut.getAt([1]).should.be.closeTo(0.8004, 0.0001);
      },
    );


    it(
      'should perform backward pass',
      async () => {
        h.data.optimizer.setValue(Dense.WEIGHT_MATRIX, new Matrix([[0.1, 0.3, 0.5], [0.2, 0.4, 0.6]]));
        h.data.optimizer.setValue(Dense.BIAS_VECTOR, new Vector([0.5]));

        o.data.optimizer.setValue(Dense.WEIGHT_MATRIX, new Matrix([[0.7, 0.9], [0.8, 0.1]]));
        o.data.optimizer.setValue(Dense.BIAS_VECTOR, new Vector([0.5]));

        await m.fit([1, 4, 5], [0.1, 0.05]);

        const oBack = o.data.backpropOutput.getValue(Layer.ERROR_TERM);
        const hBack = h.data.backpropOutput.getValue(Layer.ERROR_TERM);

        oBack.getDims().should.deep.equal([2]);
        oBack.getAt(0).should.be.closeTo(0.0775735, 0.00001);
        oBack.getAt(1).should.be.closeTo(0.1198838, 0.00001);

        hBack.getDims().should.deep.equal([2]);
        hBack.getAt(0).should.be.closeTo(0.00198264, 0.00001);
        hBack.getAt(1).should.be.closeTo(0.00040082, 0.00001);

        // @ts-ignore
        const odWeight = o.calculateWeightDerivative(new Vector(oBack));
        // @ts-ignore
        const odBias = o.calculateBiasDerivative(new Vector(oBack));

        odWeight.getDims().should.deep.equal([2, 2]);
        odWeight.getAt([0, 0]).should.be.closeTo(0.0765, 0.0001);
        odWeight.getAt([0, 1]).should.be.closeTo(0.1183, 0.0001);
        odWeight.getAt([1, 0]).should.be.closeTo(0.0772, 0.0001);
        odWeight.getAt([1, 1]).should.be.closeTo(0.1193, 0.0001);
        odBias.getAt(0).should.be.closeTo(0.1975, 0.001);

        // @ts-ignore
        const hdWeight = h.calculateWeightDerivative(new Vector(hBack));
        // @ts-ignore
        const hdBias = h.calculateBiasDerivative(new Vector(hBack));

        hdWeight.getDims().should.deep.equal([3, 2]);
        hdWeight.getAt([0, 0]).should.be.closeTo(0.002, 0.0001);
        hdWeight.getAt([1, 0]).should.be.closeTo(0.0079, 0.0001);
        hdWeight.getAt([2, 0]).should.be.closeTo(0.0099, 0.0001);
        hdWeight.getAt([0, 1]).should.be.closeTo(0.0004, 0.0001);
        hdWeight.getAt([1, 1]).should.be.closeTo(0.0016, 0.0001);
        hdWeight.getAt([2, 1]).should.be.closeTo(0.0020, 0.0001);
        hdBias.getAt(0).should.be.closeTo(0.0008, 0.0001);
      },
    );
  },
);
