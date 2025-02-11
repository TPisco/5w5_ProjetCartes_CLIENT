import { Component, HostBinding, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-health',
    templateUrl: './health.component.html',
    styleUrls: ['./health.component.css'],
    standalone: true
})
export class HealthComponent implements OnInit, OnChanges {

  @Input() enemy: boolean = false;
  @Input() playername: string = "Test"
  @Input() maxhealth: number = 0;
  @Input() health: number = 0;
  @Input() mana: number = 0;

  animate: boolean = false;
  healing: boolean = true;
  oldhealth: number = 0;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.animate = true;
    setTimeout(() => {
      this.animate = false;
      this.oldhealth = this.health;
    },1000)
  }

  ngOnInit() {
    this.animate = true;
    setTimeout(() => {this.animate = false;},1500)
  }

  getWidth() {
    if(this.oldhealth < this.health)
      return this.oldhealth/this.maxhealth*100;
    else
      return this.health/this.maxhealth*100
  }

}
