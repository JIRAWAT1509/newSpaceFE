import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { REPORT_CATEGORIES, REPORT_ITEMS, ReportItem } from '../../reports.data';

@Component({
  selector: 'app-reports-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reports-home.component.html',
  styleUrl: './reports-home.component.css',
})
export class ReportsHomeComponent implements OnInit {
  categories = REPORT_CATEGORIES;
  items = REPORT_ITEMS;
  selectedCategoryId = 'all';
  favoritesOnly = false;
  searchQuery = '';
  private bookmarks = new Set<string>();
  private readonly bookmarkKey = 'space_report_bookmarks';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.loadBookmarks();
    this.route.paramMap.subscribe((params) => {
      const category = params.get('category');
      this.selectedCategoryId = category || 'all';
    });
  }

  get filteredItems(): ReportItem[] {
    let result = this.items;
    if (this.selectedCategoryId !== 'all') {
      result = result.filter(
        (item) => item.category === this.selectedCategoryId
      );
    }
    if (this.favoritesOnly) {
      result = result.filter((item) => this.bookmarks.has(item.id));
    }
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }
    return result;
  }

  selectCategory(categoryId: string): void {
    if (categoryId === 'all') {
      this.router.navigate(['/reports']);
    } else {
      this.router.navigate(['/reports/category', categoryId]);
    }
  }

  toggleFavoriteFilter(): void {
    this.favoritesOnly = !this.favoritesOnly;
  }

  get selectedCategoryName(): string {
    if (this.selectedCategoryId === 'all') {
      return 'รายงานทั้งหมด';
    }
    return (
      this.categories.find((category) => category.id === this.selectedCategoryId)
        ?.name || 'รายงาน'
    );
  }

  isBookmarked(reportId: string): boolean {
    return this.bookmarks.has(reportId);
  }

  toggleBookmark(report: ReportItem, event: MouseEvent): void {
    event.stopPropagation();
    if (this.bookmarks.has(report.id)) {
      this.bookmarks.delete(report.id);
    } else {
      this.bookmarks.add(report.id);
    }
    this.persistBookmarks();
  }

  openReport(report: ReportItem): void {
    if (report.route) {
      this.router.navigate([report.route]);
    }
  }

  private loadBookmarks(): void {
    const raw = localStorage.getItem(this.bookmarkKey);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as string[];
      this.bookmarks = new Set(parsed);
    } catch {
      this.bookmarks = new Set();
    }
  }

  private persistBookmarks(): void {
    localStorage.setItem(
      this.bookmarkKey,
      JSON.stringify(Array.from(this.bookmarks))
    );
  }
}
