import LayerGraph from './graph/layer-graph';
import Layer from './layer/layer';


class Model
{
	protected graph : LayerGraph = new LayerGraph();


	public add( layer : Layer, parentLayer? : Layer )
	{
		return this.graph.add( layer, parentLayer );
	}


	public push( layer : Layer )
	{
		return this.graph.push( layer );
	}


	public compile()
	{
	}


	public fit()
	{
	}


	public evaluate()
	{
	}


	public predict()
	{
	}
}

export default Model;
