import _ from 'lodash';
import { Symbol } from './symbol';

export interface SymbolDescriptor {
	[key: string]: Symbol;
}



export class SymbolCollection
{
	private symbols : SymbolDescriptor = {};

	constructor( collection? : SymbolCollection )
	{
		if( collection )
		{
			this.symbols = _.cloneDeep( collection.symbols );
		}
	}


	public clear() : void
	{
		this.symbols = {};
	}


	public add( key : string, value : Symbol ) : void
	{
		if( this.has( key ) === true )
		{
			throw new Error( `Key '${key} already exists in this collection` );
		}

		this.symbols[ key ] = value;
	}


	public set( key : string, value : Symbol ) : void
	{
		this.mustHave( key );

		this.symbols[ key ] = value;
	}


	public has( key : string ) : boolean
	{
		return this.symbols.hasOwnProperty( key );
	}


	protected mustHave( key : string ) : void
	{
		if( this.has( key ) === false )
		{
			throw new Error( `Unknown key '${key}'` );
		}
	}


	public get( key : string ) : Symbol
	{
		this.mustHave( key );

		return this.symbols[ key ];
	}


	public remove( key : string ) : void
	{
		delete this.symbols[ key ];
	}


	public clone() : SymbolCollection
	{
		return new SymbolCollection( this );
	}
}

