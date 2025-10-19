import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchQuery = signal<string>('');

  getSearchQuery(): string {
    return this.searchQuery();
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
    // Here you can add logic to perform actual search
    console.log('Search query:', query);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }
}
