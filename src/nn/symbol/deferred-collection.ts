import _ from 'lodash';
import { DeferredValue, DeferredValueType } from './deferred-value';

export interface DeferredValueCollectionInf {
  [key: string]: DeferredValue;
}


export class DeferredCollection {
  private collection: DeferredValueCollectionInf = {};

  private defaultKey: string = 'default';


  public declare(key: string, dimensions:number[]|number): void {
    if (key in this.collection) {
      throw new Error(`Key '${key}' has already been declared`);
    }

    this.collection[key] = new DeferredValue(dimensions);
  }


  public get(key: string): DeferredValue {
    this.require(key);

    return this.collection[key];
  }


  public getValue(key: string): DeferredValueType {
    this.require(key);

    return this.collection[key].get();
  }


  public getKeys(): string[] {
    return _.keys(this.collection);
  }


  public setValue(key: string, value: DeferredValueType): void {
    this.require(key);

    this.collection[key].set(value);
  }


  public setDefaultKey(key: string): void {
    this.require(key);

    this.defaultKey = key;
  }


  public getDefaultKey(): string {
    return this.defaultKey;
  }


  public getDefault(): DeferredValue {
    if (!this.defaultKey) {
      throw new Error('Default key has not been set');
    }

    return this.get(this.defaultKey);
  }


  public require(key: string): void {
    if (!(key in this.collection)) {
      throw new Error(`Unknown key: '${key}'`);
    }
  }


  public requireDefault(): void {
    this.require(this.defaultKey);
  }
}
