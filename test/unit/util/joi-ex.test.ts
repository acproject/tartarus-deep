/* eslint-disable import/no-duplicates */

import { expect } from 'chai';

import { JoiEx, ClassManager } from '../../../src/util';
import { Activation } from '../../../src/nn/activation';

// tslint:disable-next-line
import * as activations from '../../../src/nn/activation';


describe(
  'JoiEx',
  () => {
    it(
      'should pass instantiated objects through coercing validators',
      () => {
        const cm          = new ClassManager(activations, Activation);
        const schema      = JoiEx.activation();
        const activation  = cm.factory('sigmoid');
        const result      = JoiEx.validate(activation, schema);

        expect(result.error).to.equal(null);
        expect(result.value).to.equal(activation);
        expect(result.value).to.be.instanceOf(Activation);
        expect(result.value).to.be.instanceOf(activations.Sigmoid);
      },
    );

    it(
      'should not pass instantiated objects through coercing validators',
      () => {
        const schema      = JoiEx.activation();
        const activation  = { moo: 'moo' };
        const result      = JoiEx.validate(activation, schema);

        expect(result.error).to.match(/Unexpected data type passed to the coerce function/);
      },
    );


    it(
      'should instantiate class names passed to coerce() validator',
      () => {
        const schema  = JoiEx.activation();
        const result  = JoiEx.validate('sigmoid', schema);

        expect(result.error).to.equal(null);
        expect(result.value).to.be.instanceOf(Activation);
        expect(result.value).to.be.instanceOf(activations.Sigmoid);
      },
    );


    it(
      'should not instantiate unknown class names passed to coerce() validator',
      () => {
        const schema  = JoiEx.activation();
        const result  = JoiEx.validate('this-does-not-exist', schema);

        expect(result.error).to.match(/Unexpected data type passed to the coerce function/);
      },
    );


    it(
      'should instantiate default value, if no data passed',
      () => {
        const schema  = JoiEx.activation().optional().default('sigmoid');
        const result  = JoiEx.validate(undefined, schema);

        expect(result.error).to.equal(null);
        expect(result.value).to.be.instanceOf(Activation);
        expect(result.value).to.be.instanceOf(activations.Sigmoid);
      },
    );


    it(
      'should fail to instantiate an initializer, if "layer" parameter is not given',
      () => {
        const schema = JoiEx.initializer().optional().default('zero');
        const result = JoiEx.validate(undefined, schema);

        expect(result.error).to.not.equal(null);
        expect(result.error).to.match(/Initializer schemas must use .layer\(\)/);
      },
    );


    it(
      'should fail to instantiate an initializer, if "layer" parameter is empty',
      () => {
        // @ts-ignore
        (() => (JoiEx.initializer().layer())).should.Throw(/"layer" is required/);
      },
    );


    it(
      'should fail to instantiate an initializer, if "layer" parameter contains an invalid object',
      () => {
        // @ts-ignore
        const schema = JoiEx.initializer().layer('mooo').optional().default('zero');
        const result = JoiEx.validate(undefined, schema);

        expect(result.error).to.not.equal(null);
        expect(result.error).to.match(/Unexpected data type passed to the coerce function/);
      },
    );
  },
);
