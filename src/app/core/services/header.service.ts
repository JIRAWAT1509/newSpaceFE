import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  // Signal to hold the scrolled state
  private scrolledState = signal<boolean>(false);

  // Public read-only signal for components to subscribe to
  public readonly isScrolled = this.scrolledState.asReadonly();

  constructor() { }

  /**
   * Called by the HeaderComponent to update the global scrolled state.
   * @param isScrolled - The new scrolled state.
   */
  setScrolledState(isScrolled: boolean): void {
    this.scrolledState.set(isScrolled);
  }
}
