/**
 * Bidirectional RNN interface
 */

import { layer, initializer, Layer, LstmLayer, SoftmaxLayer, Model, Initializer, RNNLayer } from '../src';
import { ModelFactory, ModelFactoryOpts } from './model-factory';
import _ from 'lodash';


const model = new Model('BRNN Test');
const x     = new StreamInput();
const depth = 10;




