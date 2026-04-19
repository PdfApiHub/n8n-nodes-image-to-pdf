import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeApiError, NodeOperationError } from 'n8n-workflow';
import { description, execute } from './actions/imageToPdf';

export class ImageToPdf implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Image to PDF',
		name: 'imageToPdf',
		icon: { light: 'file:../../icons/icon.svg', dark: 'file:../../icons/icon.svg' },
		group: ['transform'],
		version: 1,
		description: 'Convert JPG, PNG, or WebP images into PDF documents using PDF API Hub',
		defaults: { name: 'Image to PDF' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'pdfapihubApi', required: true }],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
				{
								"name": "PNG to PDF",
								"value": "pngToPdf",
								"description": "Convert PNG image(s) to PDF",
								"action": "Convert PNG images to PDF"
				},
				{
								"name": "JPG to PDF",
								"value": "jpgToPdf",
								"description": "Convert JPEG image(s) to PDF",
								"action": "Convert JPG images to PDF"
				},
				{
								"name": "WebP to PDF",
								"value": "webpToPdf",
								"description": "Convert WebP image(s) to PDF",
								"action": "Convert WebP images to PDF"
				}
],
				default: 'pngToPdf',
			},
			...description,
		],
	};


	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				await execute.call(this, i, returnData, operation);
			} catch (error) {
				if (this.continueOnFail()) {
					const message = error instanceof Error ? error.message : 'Unknown error';
					returnData.push({ json: { error: message }, pairedItem: { item: i } });
				} else if (error instanceof NodeApiError) {
					throw error;
				} else {
					throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
				}
			}
		}
		return [returnData];
	}
}
