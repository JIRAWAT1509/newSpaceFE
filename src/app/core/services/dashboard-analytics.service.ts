// src/app/core/services/dashboard-analytics.service.ts

import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { Deal } from '@core/models/pipeline.model';
import { Customer } from '@core/models/customer.model';
import { StageConversion } from '@core/models/dashboard.types';

@Injectable({
  providedIn: 'root'
})
export class DashboardAnalyticsService {

  // ==================== WIN RATE CALCULATIONS ====================

  /**
   * Calculate overall win rate from deals
   * Win rate = (Won deals / Total closed deals) * 100
   */
  calculateWinRate(deals: Deal[], days?: number): number {
    let filteredDeals = deals;

    // Filter by date range if specified
    if (days) {
      const cutoffDate = DateTime.now().minus({ days });
      filteredDeals = deals.filter(d => {
        const createdDate = DateTime.fromISO(d.createdAt);
        return createdDate >= cutoffDate;
      });
    }

    // For mock data, we'll use the actualWinRate from the stage
    // In production, you'd filter by status: 'won' vs 'lost'
    if (filteredDeals.length === 0) return 0;

    // Mock calculation: average of all deal win rates
    const avgWinRate = filteredDeals.reduce((sum, d) => sum + d.actualWinRate, 0) / filteredDeals.length;

    return Math.round(avgWinRate);
  }

  /**
   * Calculate win rate for a specific rep
   */
  calculateRepWinRate(deals: Deal[], repId: string): number {
    const repDeals = deals.filter(d => d.ownerId === repId);
    return this.calculateWinRate(repDeals);
  }

  // ==================== CONVERSION RATE CALCULATIONS ====================

  /**
   * Calculate conversion rates between pipeline stages
   */
  calculateStageConversions(deals: Deal[]): StageConversion[] {
    const stages = [
      { id: 'stage-001', name: 'Lead' },
      { id: 'stage-002', name: 'Prospect' },
      { id: 'stage-003', name: 'Quotation' },
      { id: 'stage-004', name: 'Negotiation' },
      { id: 'stage-005', name: 'Contract' }
    ];

    const conversions: StageConversion[] = [];

    for (let i = 0; i < stages.length - 1; i++) {
      const currentStage = stages[i];
      const nextStage = stages[i + 1];

      const currentDeals = deals.filter(d => d.stageId === currentStage.id);
      const currentCount = currentDeals.length;

      // In a real system, you'd track deal movement history
      // For mock data, we'll use approximate conversions based on win rates
      const nextDeals = deals.filter(d => d.stageId === nextStage.id);
      const movedCount = nextDeals.length;

      // Calculate conversion rate
      const conversionRate = currentCount > 0 ? (movedCount / currentCount) * 100 : 0;

      // Calculate median days
      const daysInStage = currentDeals.map(d => d.daysInStage);
      const medianDays = this.calculateMedian(daysInStage);

      // Stuck deals (>30 days in stage)
      const stuck = currentDeals.filter(d => d.daysInStage > 30).length;

      conversions.push({
        fromStage: currentStage.name,
        toStage: nextStage.name,
        conversionRate: Math.round(conversionRate),
        medianDays: Math.round(medianDays),
        dealsMoved: movedCount,
        dealsStuck: stuck
      });
    }

    return conversions;
  }

  // ==================== TIME CALCULATIONS ====================

  /**
   * Calculate average days to close deals
   */
  calculateAverageDaysToClose(deals: Deal[]): number {
    if (deals.length === 0) return 0;

    const totalDays = deals.reduce((sum, deal) => {
      const created = DateTime.fromISO(deal.createdAt);
      const moved = DateTime.fromISO(deal.movedToStageAt);
      const days = moved.diff(created, 'days').days;
      return sum + days;
    }, 0);

    return totalDays / deals.length;
  }

  /**
   * Calculate days in current stage
   */
  calculateDaysInStage(deal: Deal): number {
    const movedDate = DateTime.fromISO(deal.movedToStageAt);
    const now = DateTime.now();
    return Math.floor(now.diff(movedDate, 'days').days);
  }

  /**
   * Calculate days until due
   */
  calculateDaysUntilDue(deal: Deal): number {
    const dueDate = DateTime.fromISO(deal.dueDate);
    const now = DateTime.now();
    return Math.floor(dueDate.diff(now, 'days').days);
  }

  // ==================== ATTAINMENT CALCULATIONS ====================

  /**
   * Calculate attainment percentage
   */
  calculateAttainment(actual: number, target: number): number {
    if (target === 0) return 0;
    return Math.round((actual / target) * 100);
  }

  /**
   * Calculate team attainment
   */
  calculateTeamAttainment(members: Array<{ ytdSales: number; ytdTarget: number }>): number {
    const totalActual = members.reduce((sum, m) => sum + m.ytdSales, 0);
    const totalTarget = members.reduce((sum, m) => sum + m.ytdTarget, 0);
    return this.calculateAttainment(totalActual, totalTarget);
  }

  // ==================== PIPELINE VALUE CALCULATIONS ====================

  /**
   * Calculate weighted pipeline value
   */
  calculateWeightedPipeline(deals: Deal[]): number {
    return deals.reduce((sum, d) => sum + d.weightedValue, 0);
  }

  /**
   * Calculate average deal size
   */
  calculateAverageDealSize(deals: Deal[]): number {
    if (deals.length === 0) return 0;
    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
    return totalValue / deals.length;
  }

  /**
   * Calculate pipeline coverage ratio
   * Coverage = Pipeline Value / Remaining Target
   */
  calculateCoverageRatio(pipelineValue: number, ytdSales: number, annualTarget: number): number {
    const remainingTarget = annualTarget - ytdSales;
    if (remainingTarget <= 0) return 100; // Target already met
    return (pipelineValue / remainingTarget) * 100;
  }

  // ==================== CUSTOMER HEALTH CALCULATIONS ====================

  /**
   * Calculate churn risk score
   */
  calculateChurnRisk(customer: Customer): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // CSAT factor
    if (customer.csat < 3.0) riskScore += 3;
    else if (customer.csat < 3.5) riskScore += 2;
    else if (customer.csat < 4.0) riskScore += 1;

    // Overdue payments
    if (customer.overduePayments > 0) riskScore += 2;

    // Last contact
    if (customer.lastContactDate) {
      const lastContact = DateTime.fromISO(customer.lastContactDate);
      const daysSince = DateTime.now().diff(lastContact, 'days').days;
      if (daysSince > 60) riskScore += 3;
      else if (daysSince > 45) riskScore += 2;
      else if (daysSince > 30) riskScore += 1;
    }

    // Classify risk
    if (riskScore >= 5) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }

  /**
   * Calculate customer lifetime value (CLV)
   */
  calculateCLV(customer: Customer, avgChurnRate: number = 0.085): number {
    // CLV = ARR / Churn Rate
    return customer.arr / avgChurnRate;
  }

  /**
   * Calculate average CSAT
   */
  calculateAverageCSAT(customers: Customer[]): number {
    if (customers.length === 0) return 0;
    const totalCSAT = customers.reduce((sum, c) => sum + c.csat, 0);
    return Math.round((totalCSAT / customers.length) * 10) / 10;
  }

  // ==================== FORECASTING ====================

  /**
   * Project end-of-year revenue based on current pipeline
   */
  projectRevenue(currentYTD: number, pipeline: Deal[], monthsRemaining: number): number {
    const weightedPipeline = this.calculateWeightedPipeline(pipeline);

    // Simple projection: current YTD + weighted pipeline
    const projection = currentYTD + (weightedPipeline * 0.7); // 70% probability

    return Math.round(projection);
  }

  /**
   * Identify deals at risk of being lost
   */
  identifyAtRiskDeals(deals: Deal[]): Deal[] {
    return deals.filter(deal => {
      // Deal is at risk if:
      // 1. Past due date
      // 2. Stuck in stage for >30 days
      // 3. In early stage but high value

      const isPastDue = deal.daysUntilDue < 0;
      const isStuck = deal.daysInStage > 30;
      const isEarlyHighValue =
        (deal.stageId === 'stage-001' || deal.stageId === 'stage-002') &&
        deal.value > 3000000;

      return isPastDue || isStuck || isEarlyHighValue;
    });
  }

  /**
   * Identify stuck deals
   */
  identifyStuckDeals(deals: Deal[], daysThreshold: number = 30): Deal[] {
    return deals.filter(d => d.daysInStage > daysThreshold);
  }

  // ==================== TREND CALCULATIONS ====================

  /**
   * Calculate percentage change
   */
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Calculate trend direction
   */
  calculateTrendDirection(change: number): 'up' | 'down' | 'neutral' {
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'neutral';
  }

  /**
   * Calculate growth rate
   */
  calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;

    const first = values[0];
    const last = values[values.length - 1];

    return this.calculatePercentageChange(last, first);
  }

  // ==================== STATISTICAL HELPERS ====================

  /**
   * Calculate median of an array
   */
  calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  }

  /**
   * Calculate average
   */
  calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  /**
   * Calculate percentile
   */
  calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;

    return sorted[Math.max(0, index)];
  }

  // ==================== FORMATTING HELPERS ====================

  /**
   * Format currency
   */
  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `฿${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `฿${(value / 1000).toFixed(0)}K`;
    }
    return `฿${Math.round(value).toLocaleString()}`;
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number, decimals: number = 0): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Format number with K/M suffix
   */
  formatNumber(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }

  /**
   * Format days
   */
  formatDays(days: number): string {
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    if (days === -1) return '1 day ago';
    if (days > 0) return `${days} days`;
    return `${Math.abs(days)} days ago`;
  }
}
