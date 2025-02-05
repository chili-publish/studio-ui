import { AssetWithPreview, Asset, AssetType } from '../src/utils/ApiTypes';

export const mockAssets: Asset[] = [
    {
        id: '65db5e5f-3610-4b25-9643-1e713a081917',
        name: 'grafx',
        relativePath: '/Root',
        type: 1,
        extension: 'png',
    },
    {
        id: 'f7951442-822e-4a3e-9a9c-2fe56bae2241',
        name: 'ProductShot',
        relativePath: '/Root',
        type: 0,
        extension: 'png',
    },
];

export const mockAssetsWithPreviews: AssetWithPreview[] = [
    {
        id: 'dc637e51-21b9-44ca-a273-13d7e133cae5',
        name: 'test',
        type: AssetType.FOLDER,
        relativePath: './',
        extension: 'PNG',
        preview: 'https://picsum.photos/200/300',
    },
    {
        id: '1c1f1237-da71-4ba1-a0a1-d7ff81a2511e',
        name: 'tempor eiusmod ',
        type: AssetType.FOLDER,
        relativePath: './',
        extension: 'PNG',
        preview: 'https://picsum.photos/200/300',
    },
    {
        id: '32b049d8-50a1-4724-8418-33cbdf6621e4',
        name: 'r',
        type: AssetType.FOLDER,
        relativePath: './',
        extension: 'JPG',
        preview: 'https://picsum.photos/200/300',
    },
    {
        id: '6d8949d4-4e76-4e2a-a86e-744d132e6360',
        name: 'asset1',
        type: AssetType.ASSET,
        relativePath: './',
        extension: 'JPG',
        preview: 'https://picsum.photos/200/300',
    },
    {
        id: '5014f427-3b89-4999-9085-e83a384502a0',
        name: 'fugiat sit qui',
        type: AssetType.ASSET,
        relativePath: './',
        extension: 'PNG',
        preview: 'https://picsum.photos/200/300',
    },
    {
        id: '3050a977-7c04-433e-b02b-538bb0da18b0',
        name: 'pariatur mollit e',
        type: AssetType.ASSET,
        relativePath: './',
        extension: 'JPG',
        preview: 'https://picsum.photos/200/300',
    },
    {
        id: 'd0ee13aa-8364-42b5-ac8e-2c396421cb2e',
        name: 'This image',
        type: AssetType.ASSET,
        relativePath: './',
        extension: 'JPG',
        preview: 'https://picsum.photos/200/300',
    },
    {
        id: 'f7844f8c-7372-4095-b199-0236e93c8a6a',
        name: 'magna enim eius',
        type: AssetType.ASSET,
        relativePath: './',
        extension: 'JPG',
        preview: 'https://picsum.photos/200/300',
    },
    {
        id: 'e613c1c3-8ad7-4ff2-b648-74eafd1b9a5f',
        name: 'excepteur tempor am',
        type: AssetType.ASSET,
        relativePath: './',
        extension: 'PNG',
        preview: 'https://picsum.photos/200/300',
    },
    {
        id: 'a9d1a051-bfd5-4ad8-a7cb-a38dee5dd966',
        name: 'laborum in ullamco ',
        type: AssetType.ASSET,
        relativePath: './',
        extension: 'PNG',
        preview: 'https://picsum.photos/200/300',
    },
];

export const level2assets: AssetWithPreview[] = [
    {
        id: 'dc637e51-21b9-44ca-a273-13d7e133cae5',
        name: 'test',
        type: AssetType.FOLDER,
        relativePath: './',
        extension: 'PNG',
        preview: 'https://picsum.photos/200/300',
    },
    {
        id: 'e613c1c3-8ad7-4ff2-b648-74eafd1b9a5f',
        name: 'excepteur tempor am',
        type: AssetType.ASSET,
        relativePath: './',
        extension: 'PNG',
        preview: 'https://picsum.photos/200/300',
    },
    {
        id: 'a9d1a051-bfd5-4ad8-a7cb-a38dee5dd966',
        name: 'laborum in ullamco ',
        type: AssetType.ASSET,
        relativePath: './',
        extension: 'PNG',
        preview: 'https://picsum.photos/200/300',
    },
];
