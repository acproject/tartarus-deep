import _ from 'lodash';
import { GraphEntity } from './entity';
import { DeferredInputCollection } from '../symbols';


export class GraphNode {
  private readonly entity: GraphEntity;

  private rawInputs: DeferredInputCollection = new DeferredInputCollection();

  private rawBackpropInputs: DeferredInputCollection = new DeferredInputCollection();

  private outputNodes: GraphNode[] = [];

  private inputNodes: GraphNode[] = [];


  public constructor(entity: GraphEntity) {
    this.entity = entity;
  }


  public getEntity(): GraphEntity {
    return this.entity;
  }


  public addOutputNode(node: GraphNode): void {
    this.outputNodes.push(node);
  }


  public addInputNode(node: GraphNode): void {
    this.inputNodes.push(node);
  }


  public removeOutput(node: GraphNode): void {
    _.remove(this.inputNodes, (input: GraphNode) => (node === input));
  }


  public removeInput(node: GraphNode): void {
    _.remove(this.outputNodes, (output: GraphNode) => (node === output));
  }


  public getInputNodes(): GraphNode[] {
    return this.inputNodes;
  }


  public getOutputNodes(): GraphNode[] {
    return this.outputNodes;
  }


  public getName(): string {
    return this.entity.getName();
  }


  public overrideRawInputs(inputs: DeferredInputCollection): void {
    this.rawInputs = inputs;
  }


  public getRawOutputs(): DeferredInputCollection {
    return this.entity.getRawOutputs();
  }


  public getRawInputs(): DeferredInputCollection {
    return this.rawInputs;
  }


  public getRawBackpropOutputs(): DeferredInputCollection {
    return this.entity.getRawBackpropOutputs();
  }


  public getRawBackpropInputs(): DeferredInputCollection {
    return this.rawBackpropInputs;
  }


  public unsetOutputValues(): void {
    this.getEntity().unsetOutputValues();
  }


  public async compile(): Promise<void> {
    this.entity.setRawInputs(this.getRawInputs());

    await this.entity.compile();
  }


  public async forward(): Promise<void> {
    await this.getEntity().forward();
  }


  public async backward(): Promise<void> {
    await this.getEntity().backward();
  }


  public async initialize(): Promise<void> {
    await this.getEntity().initialize();
  }
}
