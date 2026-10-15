import { expect } from 'chai';
import type { ProductDetail, ProductSummary } from 'contracts';
import {
  cleanSimilarProducts,
  dedupeById,
  normalizeDetailImages,
  normalizeImageUrl,
} from './transform.js';

const HOST = 'cdn.example.test';

function summary(
  id: string,
  imageUrl = `http://${HOST}/${id}.jpg`,
): ProductSummary {
  return { id, brand: 'Brand', name: id, basePrice: 100, imageUrl };
}

describe('dedupeById', () => {
  it('keeps the first occurrence of each id', () => {
    const first = summary('XMI-RN13P5G', 'http://cdn.example.test/first.jpg');
    const second = summary('XMI-RN13P5G', 'http://cdn.example.test/second.jpg');
    const result = dedupeById([first, second, summary('OTHER')]);

    expect(result).to.have.length(2);
    expect(result[0]).to.equal(first);
  });

  it('counts distinct products when a limit is applied after dedupe', () => {
    const items = [
      summary('A'),
      summary('A'),
      summary('B'),
      summary('C'),
      summary('B'),
    ];
    const result = dedupeById(items).slice(0, 2);

    expect(result.map((item) => item.id)).to.deep.equal(['A', 'B']);
  });
});

describe('normalizeImageUrl', () => {
  it('rewrites an http upstream-host URL to https', () => {
    expect(normalizeImageUrl(`http://${HOST}/a.jpg`, HOST)).to.equal(
      `https://${HOST}/a.jpg`,
    );
  });

  it('leaves an https URL unchanged', () => {
    const url = `https://${HOST}/a.jpg`;
    expect(normalizeImageUrl(url, HOST)).to.equal(url);
  });

  it('leaves another host unchanged', () => {
    const url = 'http://other.test/a.jpg';
    expect(normalizeImageUrl(url, HOST)).to.equal(url);
  });

  it('leaves an unparseable value unchanged', () => {
    expect(normalizeImageUrl('not-a-url', HOST)).to.equal('not-a-url');
  });
});

describe('cleanSimilarProducts', () => {
  it('dedupes and removes the requested product', () => {
    const result = cleanSimilarProducts(
      [
        summary('SELF', 'http://cdn.example.test/self.jpg'),
        summary('DUP', 'http://cdn.example.test/dup.jpg'),
        summary('DUP', 'http://cdn.example.test/dup-2.jpg'),
        summary('KEEP', 'http://cdn.example.test/keep.jpg'),
      ],
      'SELF',
      HOST,
    );

    expect(result.map((item) => item.id)).to.deep.equal(['DUP', 'KEEP']);
  });

  it('normalizes the remaining image URLs', () => {
    const result = cleanSimilarProducts(
      [summary('DUP', `http://${HOST}/dup.jpg`)],
      'SELF',
      HOST,
    );

    expect(result[0]?.imageUrl).to.equal(`https://${HOST}/dup.jpg`);
  });
});

describe('normalizeDetailImages', () => {
  it('normalizes color images and cleans similar products', () => {
    const detail: ProductDetail = {
      id: 'APL-IP13-128',
      brand: 'Apple',
      name: 'iPhone 13',
      description: 'A phone',
      basePrice: 699.99,
      rating: 4.5,
      specs: {
        screen: '6.1',
        resolution: '1170x2532',
        processor: 'A15',
        mainCamera: '12',
        selfieCamera: '12',
        battery: '3240',
        os: 'iOS',
        screenRefreshRate: '60',
      },
      colorOptions: [
        {
          name: 'Midnight',
          hexCode: '#1C1C1E',
          imageUrl: `http://${HOST}/m.jpg`,
        },
      ],
      storageOptions: [{ capacity: '128GB', price: 699.99 }],
      similarProducts: [
        summary('APL-IP13-128', `http://${HOST}/self.jpg`),
        summary('XMI-RN13P5G', `http://${HOST}/xmi.jpg`),
      ],
    };

    const result = normalizeDetailImages(detail, HOST);

    expect(result.colorOptions[0]?.imageUrl).to.equal(`https://${HOST}/m.jpg`);
    expect(result.similarProducts.map((item) => item.id)).to.deep.equal([
      'XMI-RN13P5G',
    ]);
    expect(result.basePrice).to.equal(699.99);
    expect(result.storageOptions[0]?.price).to.equal(699.99);
  });
});
