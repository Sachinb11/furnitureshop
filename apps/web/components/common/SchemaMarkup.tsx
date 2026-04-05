const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export function SchemaMarkup({ type, data }: { type: string; data: any }) {
  let schema: Record<string, any> = {};

  if (type === 'Product' && data) {
    const price = data.salePrice ?? data.basePrice;
    schema = {
      '@context': 'https://schema.org',
      '@type':    'Product',
      name:        data.name,
      description: data.description,
      sku:         data.sku,
      image:       data.images?.map((i: any) => i.url) ?? [],
      brand:       { '@type': 'Brand', name: 'Furnishop' },
      offers: {
        '@type':        'Offer',
        priceCurrency:  'INR',
        price:          Number(price).toFixed(2),
        availability:   data.stockQuantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url: `${APP_URL}/products/${data.slug}`,
      },
      ...(Number(data.reviewCount) > 0 && {
        aggregateRating: {
          '@type':      'AggregateRating',
          ratingValue:  Number(data.avgRating).toFixed(1),
          reviewCount:  data.reviewCount,
          bestRating:   '5',
          worstRating:  '1',
        },
      }),
    };
  }

  if (type === 'Organization') {
    schema = {
      '@context': 'https://schema.org',
      '@type':    'Organization',
      name:        'Furnishop',
      url:         APP_URL,
    };
  }

  if (type === 'WebSite') {
    schema = {
      '@context': 'https://schema.org',
      '@type':    'WebSite',
      name:        'Furnishop',
      url:         APP_URL,
      potentialAction: {
        '@type':        'SearchAction',
        target:         { '@type': 'EntryPoint', urlTemplate: `${APP_URL}/products?search={search_term_string}` },
        'query-input':  'required name=search_term_string',
      },
    };
  }

  if (Object.keys(schema).length === 0) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  );
}
