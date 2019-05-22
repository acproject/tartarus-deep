import Joi from 'joi';

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface Parameters {}

export type FinalParameters<T> = {
  readonly [P in keyof T]-?: T[P];
};


export abstract class Parameterized<TInput extends Parameters, TCoerced extends TInput = TInput> {
  protected readonly params: FinalParameters<TCoerced>;

  public constructor(params: TInput = {} as any) {
    this.params = this.validateParams(params);
  }


  public abstract getParamSchema(): Joi.Schema;


  public validateParams(params: TInput): FinalParameters<TCoerced> {
    const result = Joi.validate(params, this.getParamSchema());

    if (result.error) {
      throw result.error;
    }

    return result.value as unknown as FinalParameters<TCoerced>;
  }
}

