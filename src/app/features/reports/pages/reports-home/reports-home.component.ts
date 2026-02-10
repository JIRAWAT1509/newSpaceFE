import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { REPORT_CATEGORIES, REPORT_ITEMS, ReportItem } from '../../reports.data';
import { BookmarkService } from '@core/services/bookmark.service'; // ✅ เพิ่ม
import { NavigationSecondary } from '@core/models/navigation.model'; // ✅ เพิ่ม

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookmarkService: BookmarkService // ✅ inject
  ) {}

  ngOnInit(): void {
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
      result = result.filter((item) => this.isBookmarked(item.id));
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

  // ✅ ใช้ BookmarkService แทน
  isBookmarked(reportId: string): boolean {
    return this.bookmarkService.isBookmarked(`/reports/${reportId}`);
  }

  // ✅ Toggle bookmark และเพิ่มเข้า sidebar
  toggleBookmark(report: ReportItem, event: MouseEvent): void {
    event.stopPropagation();

    // สร้าง NavigationSecondary object
    const bookmarkItem: NavigationSecondary = {
      name: report.title,
      icon: 'pi-file-export', // ใช้ PrimeNG icon
      route: `/reports/${report.id}`,
      isBookmark: true
    };

    this.bookmarkService.toggleBookmark(bookmarkItem);
  }

  openReport(report: ReportItem): void {
    if (report.route) {
      this.router.navigate([report.route]);
    }
  }
}
