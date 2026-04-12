import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../../core/models/product.models';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() view = new EventEmitter<number>();
  readonly defaultImage = '/assets/default-product.svg';

  onView(): void {
    this.view.emit(this.product.id);
  }

  get imageSrc(): string {
    return this.product.imageUrl || this.defaultImage;
  }
}
