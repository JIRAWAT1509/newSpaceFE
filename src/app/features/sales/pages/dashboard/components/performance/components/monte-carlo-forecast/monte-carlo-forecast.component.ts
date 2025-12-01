// monte-carlo-forecast.component.ts
import { Component, Input, Output, EventEmitter, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonteCarloSimulation } from '@core/data/sales-performance.mock';

interface SimulationResult {
  probability: number;
  expectedRevenue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  simulations: number;
  timestamp: string;
}

@Component({
  selector: 'app-monte-carlo-forecast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monte-carlo-forecast.component.html',
  styleUrl: './monte-carlo-forecast.component.css'
})
export class MonteCarloForecastComponent implements OnInit {

  // ==================== INPUTS ====================
  @Input() data: MonteCarloSimulation | null = null;
  @Input() isRunning: boolean = false;
  @Input() winRate: number = 31; // Default win rate percentage

  // ==================== OUTPUTS ====================
  @Output() runSimulation = new EventEmitter<void>();

  // ==================== SIGNALS ====================

  // Simulation data
  simulationData = signal<MonteCarloSimulation | null>(null);

  // UI State
  isSimulating = signal<boolean>(false);
  simulationProgress = signal<number>(0);
  lastSimulationTime = signal<string | null>(null);

  // Simulation history (for comparison)
  simulationHistory = signal<SimulationResult[]>([]);

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    this.initializeData();
  }

  // Initialize data from input
  initializeData(): void {
    if (!this.data) {
      console.warn('No Monte Carlo data provided');
      this.simulationData.set(null);
      return;
    }

    // Calculate initial probability if not set
    const initialData = { ...this.data };
    if (initialData.probability === 0) {
      initialData.probability = this.calculateProbability(
        initialData.currentPipeline,
        initialData.target,
        this.winRate
      );
    }

    this.simulationData.set(initialData);
    console.log('Monte Carlo Data Initialized:', initialData);
  }

  // ==================== COMPUTED ====================

  // Current probability with formatting
  currentProbability = computed(() => {
    const data = this.simulationData();
    return data ? data.probability : 0;
  });

  // Gap to target
  gapToTarget = computed(() => {
    const data = this.simulationData();
    if (!data) return 0;

    return data.expectedRevenue - data.target;
  });

  // Gap percentage
  gapPercentage = computed(() => {
    const data = this.simulationData();
    if (!data || data.target === 0) return 0;

    return Math.round((data.expectedRevenue / data.target - 1) * 100);
  });

  // Pipeline coverage (how much pipeline we have vs target)
  pipelineCoverage = computed(() => {
    const data = this.simulationData();
    if (!data || data.target === 0) return 0;

    return Math.round((data.currentPipeline / data.target) * 100);
  });

  // Success likelihood category
  successLikelihood = computed((): 'excellent' | 'good' | 'fair' | 'poor' => {
    const prob = this.currentProbability();
    if (prob >= 80) return 'excellent';
    if (prob >= 60) return 'good';
    if (prob >= 40) return 'fair';
    return 'poor';
  });

  // Confidence range
  confidenceRange = computed(() => {
    const data = this.simulationData();
    if (!data) return 0;

    return data.confidenceInterval.upper - data.confidenceInterval.lower;
  });

  // ==================== CALCULATION METHODS ====================

  // Calculate probability to hit target
  calculateProbability(pipeline: number, target: number, winRate: number): number {
    // Simple Monte Carlo simulation logic:
    // Expected Revenue = Pipeline * (Win Rate / 100)
    // Probability = min((Expected Revenue / Target) * 100, 100)

    const winRateDecimal = winRate / 100;
    const expectedRevenue = pipeline * winRateDecimal;
    const probability = Math.min((expectedRevenue / target) * 100, 100);

    return Math.round(probability);
  }

  // Calculate expected revenue
  calculateExpectedRevenue(pipeline: number, winRate: number): number {
    const winRateDecimal = winRate / 100;
    return Math.round(pipeline * winRateDecimal);
  }

  // Calculate confidence interval (simplified)
  calculateConfidenceInterval(expectedRevenue: number): { lower: number; upper: number } {
    // Standard deviation approximation: 15% of expected revenue
    const stdDev = expectedRevenue * 0.15;

    // 95% confidence interval (±1.96 * stdDev)
    const margin = stdDev * 1.96;

    return {
      lower: Math.round(Math.max(0, expectedRevenue - margin)),
      upper: Math.round(expectedRevenue + margin)
    };
  }

  // Recalculate all metrics
  recalculateMetrics(): void {
    const data = this.simulationData();
    if (!data) return;

    const expectedRevenue = this.calculateExpectedRevenue(data.currentPipeline, this.winRate);
    const confidenceInterval = this.calculateConfidenceInterval(expectedRevenue);
    const probability = this.calculateProbability(data.currentPipeline, data.target, this.winRate);

    const updatedData: MonteCarloSimulation = {
      ...data,
      probability,
      expectedRevenue,
      confidenceInterval,
      simulations: 1000
    };

    this.simulationData.set(updatedData);

    // Add to history
    this.addToHistory(updatedData);

    console.log('Recalculated Monte Carlo Metrics:', updatedData);
  }

  // ==================== SIMULATION ====================

  // Run Monte Carlo simulation
  onRunSimulation(): void {
    if (this.isSimulating()) return;

    console.log('Starting Monte Carlo simulation...');

    this.isSimulating.set(true);
    this.simulationProgress.set(0);

    // Emit event to parent (for coordination)
    this.runSimulation.emit();

    // Simulate progress
    const progressInterval = setInterval(() => {
      const current = this.simulationProgress();
      if (current < 100) {
        this.simulationProgress.set(Math.min(current + 10, 100));
      }
    }, 250);

    // Simulate calculation time (2.5 seconds)
    setTimeout(() => {
      clearInterval(progressInterval);
      this.simulationProgress.set(100);

      // Add some randomness to make it realistic
      this.addSimulationVariance();

      // Recalculate with new variance
      this.recalculateMetrics();

      // Update timestamp
      const now = new Date();
      this.lastSimulationTime.set(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));

      // Reset state after brief delay
      setTimeout(() => {
        this.isSimulating.set(false);
        this.simulationProgress.set(0);
      }, 500);

      console.log('Monte Carlo simulation completed');
    }, 2500);
  }

  // Add variance to simulation (make it realistic)
  private addSimulationVariance(): void {
    const data = this.simulationData();
    if (!data) return;

    // Add ±5% variance to win rate for realistic simulation
    const variance = (Math.random() * 10) - 5; // -5% to +5%
    const adjustedWinRate = Math.max(10, Math.min(50, this.winRate + variance));

    // Recalculate with adjusted win rate
    const expectedRevenue = this.calculateExpectedRevenue(data.currentPipeline, adjustedWinRate);
    const confidenceInterval = this.calculateConfidenceInterval(expectedRevenue);
    const probability = this.calculateProbability(data.currentPipeline, data.target, adjustedWinRate);

    const updatedData: MonteCarloSimulation = {
      ...data,
      probability,
      expectedRevenue,
      confidenceInterval
    };

    this.simulationData.set(updatedData);
  }

  // Add simulation result to history
  private addToHistory(data: MonteCarloSimulation): void {
    const history = this.simulationHistory();
    const result: SimulationResult = {
      probability: data.probability,
      expectedRevenue: data.expectedRevenue,
      confidenceInterval: data.confidenceInterval,
      simulations: data.simulations,
      timestamp: new Date().toISOString()
    };

    // Keep last 5 simulations
    const updatedHistory = [result, ...history].slice(0, 5);
    this.simulationHistory.set(updatedHistory);
  }

  // ==================== UTILITY METHODS ====================

  // Format currency
  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  }

  // Format percentage
  formatPercentage(value: number): string {
    return `${value}%`;
  }

  // Get probability color
  getProbabilityColor(): string {
    const likelihood = this.successLikelihood();
    const colors = {
      excellent: '#10b981',
      good: '#3b82f6',
      fair: '#f59e0b',
      poor: '#ef4444'
    };
    return colors[likelihood];
  }

  // Get probability label
  getProbabilityLabel(): string {
    const likelihood = this.successLikelihood();
    const labels = {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor'
    };
    return labels[likelihood];
  }

  // Get probability label (Thai)
  getProbabilityLabelTh(): string {
    const likelihood = this.successLikelihood();
    const labels = {
      excellent: 'ดีเยี่ยม',
      good: 'ดี',
      fair: 'พอใช้',
      poor: 'ต้องปรับปรุง'
    };
    return labels[likelihood];
  }

  // Export simulation data
  exportSimulationData(): void {
    const data = this.simulationData();
    if (!data) return;

    const exportData = {
      simulation: data,
      metrics: {
        gapToTarget: this.gapToTarget(),
        gapPercentage: this.gapPercentage(),
        pipelineCoverage: this.pipelineCoverage(),
        successLikelihood: this.successLikelihood()
      },
      history: this.simulationHistory(),
      timestamp: new Date().toISOString()
    };

    console.log('Exported Monte Carlo Data:', exportData);

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `monte-carlo-simulation-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  // Refresh data
  refreshData(): void {
    console.log('Refreshing Monte Carlo data...');
    this.initializeData();
  }
}
