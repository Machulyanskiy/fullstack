import { Component, OnInit, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import {AnalyticsService} from '../shared/services/analytics.service';
import {OverviewPage} from '../shared/interfaces';
import {Observable} from 'rxjs';
import {MaterialInstance, MaterialService} from '../shared/classes/material.service';

@Component({
  selector: 'app-overview-page',
  templateUrl: './overview-page.component.html',
  styleUrls: ['./overview-page.component.css']
})
export class OverviewPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('tapTarget') tapTargetRef: ElementRef;
  tapTarget: MaterialInstance;
  data$: Observable<OverviewPage>;
  yesterday = new Date();

  constructor(private service: AnalyticsService) { }

  ngOnInit() {
    this.yesterday.setDate(this.yesterday.getDate() - 1);
    this.data$ = this.service.getOverview()
  }

  ngOnDestroy() {
    this.tapTarget.destroy();
  }

  ngAfterViewInit() {
    this.tapTarget = MaterialService.initTapTarget(this.tapTargetRef);
  }

  openInfo() {
    this.tapTarget.open();
  }
}
