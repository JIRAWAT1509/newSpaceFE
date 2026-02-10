// stage-pagination.component.ts
import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';

interface PageOption {
  label: string;
  value: number;
}

interface CardsPerPageOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-stage-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule, Select],
  templateUrl: './stage-pagination.component.html',
  styleUrl: './stage-pagination.component.css'
})
export class StagePaginationComponent {
  // Inputs
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  totalDeals = input.required<number>();
  cardsPerPage = input.required<number>();

  // Outputs
  pageChange = output<number>();
  cardsPerPageChange = output<number>();

  // Cards per page options
  cardsPerPageOptions: CardsPerPageOption[] = [
    { label: '4 cards', value: 4 },
    { label: '8 cards', value: 8 },
    { label: '12 cards', value: 12 },
    { label: '15 cards', value: 15 }
  ];

  // Computed: Page options for dropdown
  pageOptions = computed<PageOption[]>(() => {
    const total = this.totalPages();
    const options: PageOption[] = [];

    for (let i = 1; i <= total; i++) {
      options.push({
        label: `Page ${i} of ${total}`,
        value: i
      });
    }

    return options;
  });

  // Computed: Start index (1-based)
  startIndex = computed(() => {
    const page = this.currentPage();
    const perPage = this.cardsPerPage();
    return (page - 1) * perPage + 1;
  });

  // Computed: End index
  endIndex = computed(() => {
    const page = this.currentPage();
    const perPage = this.cardsPerPage();
    const total = this.totalDeals();
    return Math.min(page * perPage, total);
  });

  // Computed: Can go previous
  canGoPrevious = computed(() => {
    return this.currentPage() > 1;
  });

  // Computed: Can go next
  canGoNext = computed(() => {
    return this.currentPage() < this.totalPages();
  });

  // Go to previous page
  previousPage(): void {
    if (this.canGoPrevious()) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  // Go to next page
  nextPage(): void {
    if (this.canGoNext()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  // Go to specific page
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

  // Change cards per page
  onCardsPerPageChange(value: number): void {
    this.cardsPerPageChange.emit(value);
  }
}
