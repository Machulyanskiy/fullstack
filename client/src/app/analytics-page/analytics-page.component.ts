import {Component, ViewChild, ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import {AnalyticsService} from '../shared/services/analytics.service';
import {AnalyticsPage} from '../shared/interfaces';
import {Subscription} from 'rxjs';
import {Chart} from 'chart.js';

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.css']
})
export class AnalyticsPageComponent implements AfterViewInit, OnDestroy {

  @ViewChild('proceeds') proceedsRef: ElementRef;
  @ViewChild('order') orderRef: ElementRef;

  average: number;
  pending = true;
  aSub: Subscription;

  constructor(private service: AnalyticsService) {
  }

  ngAfterViewInit() {
    const proceedsConfig: any = {
      label: 'Proceeds',
      color: 'rgb(255, 99, 132)',
    };

    const orderConfig: any = {
      label: 'Orders',
      color: 'rgb(54, 162, 235)',
    };

    this.aSub = this.service.getAnalytics().subscribe(
      (data: AnalyticsPage) => {
        this.average = data.average
        proceedsConfig.labels = data.chart.map(day => day.label);
        proceedsConfig.data = data.chart.map(day => day.proceeds);
        orderConfig.labels = data.chart.map(day => day.label);
        orderConfig.data = data.chart.map(day => day.order);

        // **** tempf ****
        /*proceedsConfig.labels.push('18.11.2018');
        proceedsConfig.labels.push('19.11.2018');
        proceedsConfig.data.push(300);
        proceedsConfig.data.push(120);

        orderConfig.labels.push('18.11.2018');
        orderConfig.labels.push('19.11.2018');
        orderConfig.data.push(3);
        orderConfig.data.push(8);*/
        // **** tempf ****

        const proceedsCtx = this.proceedsRef.nativeElement.getContext('2d');
        const orderCtx = this.orderRef.nativeElement.getContext('2d');
        proceedsCtx.canvas.height = '300px';
        orderCtx.canvas.height = '300px';

        new Chart(proceedsCtx, createChartConfig(proceedsConfig));
        new Chart(orderCtx, createChartConfig(orderConfig));

        this.pending = false;
    });
  }

  ngOnDestroy() {
    if (this.aSub) {
      this.aSub.unsubscribe();
    }
  }
}

function createChartConfig({labels, data, label, color}) {
  return {
    type: 'line',
    options: {
      responsive: true
    },
    data: {
      labels,
      datasets: [
        {
          label, data,
          borderColor: color,
          steppedLine: false,
          fill: false
        }
      ]
    }
  };
}
