import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { SidebarFiltersComponent } from './components/sidebar-filters/sidebar-filters.component';
import { TableComponent } from './components/table/table.component';

@NgModule({
  declarations: [ProductCardComponent, SidebarFiltersComponent, TableComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProductCardComponent,
    SidebarFiltersComponent,
    TableComponent
  ]
})
export class SharedModule {}
