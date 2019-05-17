import { Initializer } from './initializer';
import { NDArray } from '../../math';


export class Zero extends Initializer {
  public async initialize(data: NDArray): Promise<NDArray> {
    return data.set(0.0);
  }
}
