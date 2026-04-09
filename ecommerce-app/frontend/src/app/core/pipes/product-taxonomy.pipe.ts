import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'productTaxonomy'
})

export class ProductTaxonomyPipe implements PipeTransform {
  transform(product: any): string {
    if (!product?.subCategory) return '';

    const type = product.subCategory?.category?.type?.name;
    const category = product.subCategory?.category?.name;

    if (type && category) {
      return `${type} › ${category}`;
    }
    return category || type || '';
  }
}
