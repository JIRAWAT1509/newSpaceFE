// sales-dashboard.component.ts - UPDATED WITH FIXED SCROLL
import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceSectionComponent } from './components/performance/performance-section.component';
import { ActivitiesSectionComponent } from './components/activities/activities-section.component';
import { AnalysisSectionComponent } from './components/analysis/analysis-section.component';

interface NavigationCard {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  badge?: string;
  sectionId: string;
}

@Component({
  selector: 'app-sales-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PerformanceSectionComponent,
    ActivitiesSectionComponent,
    AnalysisSectionComponent
  ],
  templateUrl: './sales-dashboard.component.html',
  styleUrl: './sales-dashboard.component.css'
})
export class SalesDashboardComponent implements OnInit, AfterViewInit {
  // References to sections for scrolling
  @ViewChild('performanceSection', { read: ElementRef }) performanceSection!: ElementRef;
  @ViewChild('activitiesSection', { read: ElementRef }) activitiesSection!: ElementRef;
  @ViewChild('analysisSection', { read: ElementRef }) analysisSection!: ElementRef;

  // Reference to scroll container
  private scrollContainer: HTMLElement | null = null;

  // Navigation cards
  navigationCards = signal<NavigationCard[]>([
    {
      id: 'performance',
      title: 'ผลการดำเนินงาน',
      titleEn: 'Performance',
      description: 'ติดตามผลงานส่วนตัวและทีมขาย',
      icon: 'pi pi-chart-line',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      badge: 'อัพเดทแล้ว',
      sectionId: 'performance-section'
    },
    {
      id: 'activities',
      title: 'กิจกรรมและตารางงาน',
      titleEn: 'Activities',
      description: 'จัดการงาน การมอบหมาย และปฏิทิน',
      icon: 'pi pi-calendar',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      badge: '12 งานใหม่',
      sectionId: 'activities-section'
    },
    {
      id: 'analysis',
      title: 'การวิเคราะห์ข้อมูล',
      titleEn: 'Analysis',
      description: 'Heat Map, การจำแนกลูกค้า และ AI Analysis',
      icon: 'pi pi-chart-bar',
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      badge: 'เร็วๆ นี้',
      sectionId: 'analysis-section'
    }
  ]);

  // Active section tracking
  activeSection = signal<string>('performance');

  // Loading state
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Find the scrollable container after view init
    // Try multiple selectors to find the scroll container
    this.scrollContainer = document.querySelector('main') ||
                          document.querySelector('.main-content') ||
                          document.documentElement;

    console.log('Scroll container found:', this.scrollContainer);
  }

  // ==================== DATA LOADING ====================

  loadDashboardData(): void {
    this.isLoading.set(true);

    // Simulate API call
    setTimeout(() => {
      this.isLoading.set(false);
      console.log('Dashboard data loaded');
    }, 800);
  }

  // ==================== NAVIGATION ====================

  scrollToSection(sectionId: string): void {
    console.log('Attempting to scroll to:', sectionId);

    const element = document.getElementById(sectionId);

    if (!element) {
      console.error('Section element not found:', sectionId);
      return;
    }

    console.log('Element found:', element);

    // Method 1: Try scrollIntoView first (most reliable)
    // try {
    //   element.scrollIntoView({
    //     behavior: 'smooth',
    //     block: 'start',
    //     inline: 'nearest'
    //   });

    //   // Update active section
    //   this.activeSection.set(sectionId.replace('-section', ''));
    //   console.log('Scrolled using scrollIntoView');
    //   return;
    // } catch (error) {
    //   console.error('scrollIntoView failed:', error);
    // }

    // Method 2: Manual scroll calculation (fallback)
    if (this.scrollContainer) {
      try {
        const headerOffset = 160; // Adjust based on your header height
        const elementPosition = element.offsetTop;
        const offsetPosition = elementPosition - headerOffset;

        console.log('Scrolling container to position:', offsetPosition);

        this.scrollContainer.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Update active section
        this.activeSection.set(sectionId.replace('-section', ''));
        console.log('Scrolled using manual calculation');
      } catch (error) {
        console.error('Manual scroll failed:', error);
      }
    }
  }

  // ==================== UTILITY ====================

  getCardClasses(card: NavigationCard): string {
    return `nav-card card-${card.color}`;
  }

  isActiveSection(sectionId: string): boolean {
    return this.activeSection() === sectionId;
  }
}
