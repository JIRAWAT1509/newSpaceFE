// src/app/core/services/dashboard-data.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DateTime } from 'luxon';

// Import mock data
import { MOCK_DEALS } from '@core/data/pipeline.mock';
import { MOCK_CUSTOMERS } from '@core/data/customer.mock';
import { MOCK_USERS } from '@core/data/users.mock';
import {
  MOCK_SALES_TEAM,
  MOCK_EXTENDED_SALES_TEAM,
  MOCK_TEAM_TOTALS,
  MOCK_EXECUTIVE_SUMMARY
} from '@core/data/sales-performance.mock';

// Import types
import {
  KPIMetrics,
  KPIMetric,
  PipelineOverview,
  PipelineStageData,
  StageConversion,
  DealVelocity,
  StuckDeal,
  CustomerInsights,
  RevenueSegment,
  CustomerClassification,
  ClassData,
  TopCustomer,
  AtRiskCustomer,
  CustomerHealthMetrics,
  TeamPerformance,
  TeamMemberPerformance,
  TeamTotals,
  DASHBOARD_COLORS,
  METRIC_ICONS
} from '@core/models/dashboard.types';

// Import analytics service
import { DashboardAnalyticsService } from './dashboard-analytics.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {

  private analytics = inject(DashboardAnalyticsService);

  // ==================== KPI METRICS ====================

  getKPIMetrics(): Observable<KPIMetrics> {
    // Calculate total ARR from customers
    const customers = MOCK_CUSTOMERS.filter(c => c.status === 'customer');
    const totalARR = customers.reduce((sum, c) => sum + c.arr, 0);
    const prevQuarterARR = totalARR * 0.92; // Mock: 8% growth
    const arrTrend = ((totalARR - prevQuarterARR) / prevQuarterARR) * 100;

    // Calculate pipeline value
    const openDeals = MOCK_DEALS;
    const pipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0);
    const weightedValue = openDeals.reduce((sum, d) => sum + d.weightedValue, 0);
    const prevPipelineValue = pipelineValue * 0.88; // Mock: 12% growth
    const pipelineTrend = ((pipelineValue - prevPipelineValue) / prevPipelineValue) * 100;

    // Calculate win rate (last 60 days)
    const winRate = this.analytics.calculateWinRate(MOCK_DEALS);
    const prevWinRate = 28; // Mock previous
    const winRateTrend = winRate - prevWinRate;

    // Team attainment (calculate from sales team)
    const salesTeamMembers = MOCK_USERS.filter(u => u.role.includes('sales'));
    const teamYTDSales = salesTeamMembers.reduce((sum, u) => {
      const userDeals = MOCK_DEALS.filter(d => d.ownerId === u.id);
      return sum + (userDeals.reduce((s, d) => s + d.value, 0) * 0.6);
    }, 0);
    const teamYTDTarget = teamYTDSales * 1.4;
    const teamAttainment = (teamYTDSales / teamYTDTarget) * 100;
    const prevAttainment = 68; // Mock previous month
    const attainmentTrend = teamAttainment - prevAttainment;

    const metrics: KPIMetrics = {
      totalARR: {
        value: totalARR,
        label: 'Total ARR',
        trend: arrTrend,
        trendLabel: 'vs last quarter',
        icon: METRIC_ICONS.arr,
        color: DASHBOARD_COLORS.success,
        format: 'currency'
      },
      pipelineValue: {
        value: pipelineValue,
        label: 'Pipeline Value',
        trend: pipelineTrend,
        trendLabel: 'vs last month',
        icon: METRIC_ICONS.pipeline,
        color: DASHBOARD_COLORS.primary,
        format: 'currency'
      },
      winRate: {
        value: winRate,
        label: 'Win Rate (60d)',
        trend: winRateTrend,
        trendLabel: 'vs last period',
        icon: METRIC_ICONS.winRate,
        color: DASHBOARD_COLORS.purple,
        format: 'percentage'
      },
      teamAttainment: {
        value: teamAttainment,
        label: 'Team Attainment',
        trend: attainmentTrend,
        trendLabel: 'vs last month',
        icon: METRIC_ICONS.attainment,
        color: DASHBOARD_COLORS.warning,
        format: 'percentage'
      }
    };

    return of(metrics);
  }

  // ==================== PIPELINE ====================

  getPipelineOverview(): Observable<PipelineOverview> {
    const deals = MOCK_DEALS;

    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
    const weightedValue = deals.reduce((sum, d) => sum + d.weightedValue, 0);
    const dealCount = deals.length;
    const averageDealSize = totalValue / dealCount;

    // Group by stage
    const stageGroups = new Map<string, typeof deals>();
    deals.forEach(deal => {
      const stageDeals = stageGroups.get(deal.stageId) || [];
      stageDeals.push(deal);
      stageGroups.set(deal.stageId, stageDeals);
    });

    const stages: PipelineStageData[] = Array.from(stageGroups.entries()).map(([stageId, stageDeals]) => {
      const stageName = stageDeals[0].stageName;
      const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
      const stageWeighted = stageDeals.reduce((sum, d) => sum + d.weightedValue, 0);
      const avgDays = stageDeals.reduce((sum, d) => sum + d.daysInStage, 0) / stageDeals.length;
      const avgWinRate = stageDeals.reduce((sum, d) => sum + d.actualWinRate, 0) / stageDeals.length;

      return {
        stageId,
        stageName,
        dealCount: stageDeals.length,
        totalValue: stageValue,
        weightedValue: stageWeighted,
        averageDays: Math.round(avgDays),
        winRate: Math.round(avgWinRate),
        color: this.getStageColor(stageName)
      };
    });

    const conversionRates = this.analytics.calculateStageConversions(deals);

    return of({
      totalValue,
      weightedValue,
      dealCount,
      stages,
      averageDealSize,
      conversionRates
    });
  }

  getDealVelocity(): Observable<DealVelocity> {
    const deals = MOCK_DEALS;

    const avgDaysToClose = this.analytics.calculateAverageDaysToClose(deals);

    // Deals closing this week
    const weekEnd = DateTime.now().endOf('week');
    const closingThisWeek = deals.filter(d => {
      const dueDate = DateTime.fromISO(d.dueDate);
      return dueDate <= weekEnd;
    }).length;

    // Deals closing this month
    const monthEnd = DateTime.now().endOf('month');
    const closingThisMonth = deals.filter(d => {
      const dueDate = DateTime.fromISO(d.dueDate);
      return dueDate <= monthEnd;
    }).length;

    // Stuck deals (>30 days in stage)
    const stuckDeals: StuckDeal[] = deals
      .filter(d => d.daysInStage > 30)
      .map(d => ({
        id: d.id,
        title: d.title,
        stageName: d.stageName,
        daysInStage: d.daysInStage,
        value: d.value,
        ownerName: d.ownerName || 'Unassigned',
        dueDate: d.dueDate
      }));

    return of({
      averageDaysToClose: Math.round(avgDaysToClose),
      closingThisWeek,
      closingThisMonth,
      stuckDeals,
      velocityTrend: -5 // Mock: 5% faster than last period
    });
  }

  // ==================== CUSTOMER ====================

  getCustomerInsights(): Observable<CustomerInsights> {
    const customers = MOCK_CUSTOMERS;
    const activeCustomers = customers.filter(c => c.status === 'customer');

    // Revenue breakdown by segment
    const segmentGroups = new Map<string, typeof customers>();
    activeCustomers.forEach(customer => {
      const segmentCustomers = segmentGroups.get(customer.segment) || [];
      segmentCustomers.push(customer);
      segmentGroups.set(customer.segment, segmentCustomers);
    });

    const totalARR = activeCustomers.reduce((sum, c) => sum + c.arr, 0);

    const revenueBreakdown: RevenueSegment[] = Array.from(segmentGroups.entries())
      .map(([segment, segmentCustomers]) => {
        const arr = segmentCustomers.reduce((sum, c) => sum + c.arr, 0);
        const avgCSAT = segmentCustomers.reduce((sum, c) => sum + c.csat, 0) / segmentCustomers.length;

        return {
          segment,
          arr,
          customerCount: segmentCustomers.length,
          percentage: (arr / totalARR) * 100,
          color: this.getSegmentColor(segment),
          avgCSAT: Math.round(avgCSAT * 10) / 10
        };
      })
      .sort((a, b) => b.arr - a.arr);

    // Classification
    const classification = this.getCustomerClassification(activeCustomers, totalARR);

    // Top customers
    const topCustomers: TopCustomer[] = [...activeCustomers]
      .sort((a, b) => b.arr - a.arr)
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        companyName: c.companyName,
        arr: c.arr,
        class: c.class,
        segment: c.segment,
        csat: c.csat,
        churnRisk: c.churnRisk,
        activeContracts: c.activeContracts,
        ownerName: c.owner
      }));

    // At-risk customers
    const atRiskCustomers: AtRiskCustomer[] = customers
      .filter(c => c.churnRisk === 'high' || c.churnRisk === 'medium')
      .map(c => {
        const lastContact = DateTime.fromISO(c.lastContactDate || DateTime.now().toISO());
        const daysSince = Math.floor(DateTime.now().diff(lastContact, 'days').days);

        return {
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          companyName: c.companyName,
          arr: c.arr,
          churnRisk: c.churnRisk,
          reason: this.getChurnReason(c),
          recommendedAction: this.getRecommendedAction(c),
          daysSinceContact: daysSince,
          ownerName: c.owner,
          overduePayments: c.overduePayments
        };
      })
      .sort((a, b) => {
        // Sort by risk (high first) then by days since contact
        if (a.churnRisk === 'high' && b.churnRisk !== 'high') return -1;
        if (a.churnRisk !== 'high' && b.churnRisk === 'high') return 1;
        return b.daysSinceContact - a.daysSinceContact;
      });

    // Health metrics
    const healthMetrics = this.getCustomerHealthMetrics(customers);

    return of({
      revenueBreakdown,
      classification,
      topCustomers,
      atRiskCustomers,
      healthMetrics
    });
  }

  private getCustomerClassification(customers: typeof MOCK_CUSTOMERS, totalARR: number): CustomerClassification {
    const classes = ['A', 'B', 'C', 'D'];

    const classData: any = {};

    classes.forEach(cls => {
      const classCustomers = customers.filter(c => c.class === cls);
      const classARR = classCustomers.reduce((sum, c) => sum + c.arr, 0);
      const avgCSAT = classCustomers.length > 0
        ? classCustomers.reduce((sum, c) => sum + c.csat, 0) / classCustomers.length
        : 0;

      classData[`class${cls}`] = {
        count: classCustomers.length,
        totalARR: classARR,
        percentage: (classARR / totalARR) * 100,
        avgCSAT: Math.round(avgCSAT * 10) / 10,
        color: DASHBOARD_COLORS.classification[cls as 'A' | 'B' | 'C' | 'D']
      };
    });

    return classData as CustomerClassification;
  }

  private getCustomerHealthMetrics(customers: typeof MOCK_CUSTOMERS): CustomerHealthMetrics {
    const activeCustomers = customers.filter(c => c.status === 'customer');
    const avgCSAT = activeCustomers.reduce((sum, c) => sum + c.csat, 0) / activeCustomers.length;

    const highRisk = customers.filter(c => c.churnRisk === 'high').length;
    const mediumRisk = customers.filter(c => c.churnRisk === 'medium').length;
    const lowRisk = customers.filter(c => c.churnRisk === 'low').length;

    return {
      averageCSAT: Math.round(avgCSAT * 10) / 10,
      csatTrend: 5.2, // Mock
      churnRate: 8.5,
      churnTrend: -2.1,
      totalCustomers: customers.length,
      activeCustomers: activeCustomers.length,
      highRiskCount: highRisk,
      mediumRiskCount: mediumRisk,
      lowRiskCount: lowRisk
    };
  }

  private getChurnReason(customer: typeof MOCK_CUSTOMERS[0]): string {
    if (customer.overduePayments > 0) return 'Overdue payments';
    if (customer.csat < 3.5) return 'Low satisfaction score';

    const lastContact = DateTime.fromISO(customer.lastContactDate || DateTime.now().toISO());
    const daysSince = Math.floor(DateTime.now().diff(lastContact, 'days').days);
    if (daysSince > 45) return 'No recent contact';

    return 'Multiple risk factors';
  }

  private getRecommendedAction(customer: typeof MOCK_CUSTOMERS[0]): string {
    if (customer.overduePayments > 0) return 'Contact for payment follow-up';
    if (customer.csat < 3.5) return 'Schedule satisfaction review';

    const lastContact = DateTime.fromISO(customer.lastContactDate || DateTime.now().toISO());
    const daysSince = Math.floor(DateTime.now().diff(lastContact, 'days').days);
    if (daysSince > 45) return 'Immediate check-in call required';

    return 'General account review needed';
  }

  // ==================== TEAM PERFORMANCE ====================

  getTeamPerformance(): Observable<TeamPerformance> {
    const deals = MOCK_DEALS;
    const users = MOCK_USERS.filter(u => u.role.includes('sales'));

    const memberPerformance: TeamMemberPerformance[] = users.map(user => {
      // Get user's deals
      const userDeals = deals.filter(d => d.ownerId === user.id);
      const pipelineValue = userDeals.reduce((sum, d) => sum + d.value, 0);

      // Mock sales data (in production, would come from closed deals)
      const ytdSales = pipelineValue * 0.6; // Mock: 60% of pipeline converted
      const ytdTarget = ytdSales * 1.4; // Mock target
      const attainment = (ytdSales / ytdTarget) * 100;

      const thisMonthSales = ytdSales * 0.15; // Mock: 15% this month
      const thisWeekSales = ytdSales * 0.03; // Mock: 3% this week

      // Win rate calculation
      const totalDeals = userDeals.length;
      const wonDeals = Math.floor(totalDeals * 0.3); // Mock: 30% win rate
      const lostDeals = Math.floor(totalDeals * 0.1); // Mock: 10% lost
      const winRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;

      const avgDealSize = pipelineValue / (totalDeals || 1);
      const avgDaysToClose = userDeals.length > 0
        ? userDeals.reduce((sum, d) => sum + d.daysInStage, 0) / userDeals.length
        : 0;

      return {
        id: user.id,
        name: user.name,
        nameTh: user.nameTh,
        avatar: user.avatar,
        role: user.role,
        ytdSales,
        ytdTarget,
        attainment: Math.round(attainment),
        thisMonthSales,
        thisWeekSales,
        pipelineValue,
        pipelineDeals: userDeals.length,
        winRate: Math.round(winRate),
        dealsWon: wonDeals,
        dealsLost: lostDeals,
        avgDealSize,
        avgDaysToClose: Math.round(avgDaysToClose),
        activitiesThisWeek: Math.floor(Math.random() * 15) + 5, // Mock
        lastActivityDate: DateTime.now().minus({ days: Math.floor(Math.random() * 7) }).toISO(),
        trend: Math.floor(Math.random() * 20) - 5, // Mock: -5% to +15%
        rank: 0 // Will be calculated after sorting
      };
    });

    // Sort by YTD sales and assign ranks
    memberPerformance.sort((a, b) => b.ytdSales - a.ytdSales);
    memberPerformance.forEach((member, index) => {
      member.rank = index + 1;
    });

    // Team totals
    const teamTotals: TeamTotals = {
      totalYTD: memberPerformance.reduce((sum, m) => sum + m.ytdSales, 0),
      totalTarget: memberPerformance.reduce((sum, m) => sum + m.ytdTarget, 0),
      teamAttainment: 0, // Will be calculated
      totalPipeline: memberPerformance.reduce((sum, m) => sum + m.pipelineValue, 0),
      totalDeals: memberPerformance.reduce((sum, m) => sum + m.pipelineDeals, 0),
      teamWinRate: memberPerformance.reduce((sum, m) => sum + m.winRate, 0) / memberPerformance.length
    };
    teamTotals.teamAttainment = (teamTotals.totalYTD / teamTotals.totalTarget) * 100;

    // Top performers (top 3)
    const topPerformers = memberPerformance.slice(0, 3);

    // Needs coaching (bottom 3 by attainment)
    const needsCoaching = [...memberPerformance]
      .sort((a, b) => a.attainment - b.attainment)
      .slice(0, 3);

    return of({
      leaderboard: memberPerformance,
      teamTotals,
      topPerformers,
      needsCoaching
    });
  }

  // ==================== UTILITY METHODS ====================

  private getStageColor(stageName: string): string {
    const colorMap: Record<string, string> = {
      'Lead': DASHBOARD_COLORS.stages.lead,
      'Prospect': DASHBOARD_COLORS.stages.prospect,
      'Quotation': DASHBOARD_COLORS.stages.quotation,
      'Negotiation': DASHBOARD_COLORS.stages.negotiation,
      'Contract': DASHBOARD_COLORS.stages.contract
    };
    return colorMap[stageName] || DASHBOARD_COLORS.gray;
  }

  private getSegmentColor(segment: string): string {
    const colors = DASHBOARD_COLORS.chart;
    const segments = ['Enterprise', 'SME', 'Corporate', 'Retail', 'Startup', 'Individual', 'Education', 'Healthcare'];
    const index = segments.indexOf(segment);
    return index >= 0 ? colors[index % colors.length] : DASHBOARD_COLORS.gray;
  }
}
