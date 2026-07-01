import { Component, ViewChild, AfterViewInit, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType, Chart, registerables } from 'chart.js';
import { PortfolioService } from '../../../../core/services/manager/portfolio.service';

Chart.register(...registerables);

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, DecimalPipe],
  templateUrl: './revenue-chart.html',
})
export class RevenueChartComponent implements OnInit, AfterViewInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  private portfolioService = inject(PortfolioService);
  private cdr = inject(ChangeDetectorRef);

  public totalThisYear: number = 0;
  public averageMonthly: number = 0;
  public growthPercentage: number = 0;

  public isLoading: boolean = true;

  public lineChartType: ChartType = 'line';

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: Array(12).fill(0),
        label: 'Năm Nay',
        backgroundColor: 'rgba(23, 49, 36, 0.1)', 
        borderColor: '#173124',
        borderWidth: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#173124',
        pointBorderWidth: 3,
        pointHoverBackgroundColor: '#173124',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 4,
        fill: true,
        tension: 0.5, // Curvier
        pointRadius: 0,
        pointHoverRadius: 8, // Bigger hover
      },
      {
        data: Array(12).fill(0),
        label: 'Năm Ngoái',
        backgroundColor: 'transparent', // No fill for comparison line
        borderColor: '#a8a29e', // Lighter stone color
        borderWidth: 3,
        borderDash: [6, 6], // Dotted line for "past/expected"
        pointBackgroundColor: '#fff',
        pointBorderColor: '#a8a29e',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#a8a29e',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3,
        fill: false,
        tension: 0.5,
        pointRadius: 0,
        pointHoverRadius: 6,
      }
    ],
    labels: [ 'Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12' ]
  };

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false
        },
        ticks: {
          color: '#a8a29e', // stone-400
          padding: 10,
          font: {
            family: "'Inter', sans-serif",
            weight: 'bold',
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: '#f5f5f4', // stone-100
          drawTicks: false,
        },
        border: {
          dash: [5, 5],
          display: false 
        },
        ticks: {
          color: '#a8a29e',
          padding: 15,
          font: {
            family: "'Inter', sans-serif",
            weight: 'bold',
            size: 11
          },
          callback: function(value) {
            return (Number(value) / 1000000) + 'Tr';
          },
          maxTicksLimit: 6
        }
      }
    },
    plugins: {
      legend: {
        display: false // Using custom HTML legend instead
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#78716c',
        bodyColor: '#173124',
        titleFont: { family: "'Inter', sans-serif", size: 12, weight: 'bold' },
        bodyFont: { family: "'Inter', sans-serif", size: 15, weight: 'bold' },
        padding: 16,
        cornerRadius: 16,
        displayColors: true,
        boxPadding: 6,
        usePointStyle: true,
        borderColor: 'rgba(23, 49, 36, 0.1)',
        borderWidth: 1,
        titleSpacing: 6,
        bodySpacing: 8,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    }
  };

  ngOnInit() {
    this.portfolioService.getYearlyRevenue().subscribe({
      next: (res) => {
        const thisYearData = res.data.thisYear || Array(12).fill(0);
        const lastYearData = res.data.lastYear || Array(12).fill(0);

        // Update chart data
        this.lineChartData.datasets[0].data = thisYearData;
        this.lineChartData.datasets[1].data = lastYearData;

        // Calculate totals
        this.totalThisYear = thisYearData.reduce((a, b) => a + b, 0);
        const totalLastYear = lastYearData.reduce((a, b) => a + b, 0);

        this.averageMonthly = this.totalThisYear / 12;

        if (totalLastYear === 0) {
          this.growthPercentage = this.totalThisYear > 0 ? 100 : 0;
        } else {
          this.growthPercentage = ((this.totalThisYear - totalLastYear) / totalLastYear) * 100;
        }

        this.isLoading = false;
        
        // Trigger chart update and change detection
        this.chart?.chart?.update();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi tải dữ liệu doanh thu', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.chart?.chart?.ctx) {
        const ctx = this.chart.chart.ctx;
        
        // Gradient for this year - Much stronger glowing effect
        const gradientThisYear = ctx.createLinearGradient(0, 0, 0, 450);
        gradientThisYear.addColorStop(0, 'rgba(23, 49, 36, 0.6)');
        gradientThisYear.addColorStop(0.5, 'rgba(23, 49, 36, 0.2)');
        gradientThisYear.addColorStop(1, 'rgba(23, 49, 36, 0.0)');

        this.lineChartData.datasets[0].backgroundColor = gradientThisYear;
        // Dataset 1 is transparent, so no gradient needed
        
        this.chart.chart.update();
      }
    }, 50);
  }
}
