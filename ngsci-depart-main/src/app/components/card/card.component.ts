import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Card, CardPower } from 'src/app/models/models';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';

export interface PowerPulse {
  powerId: number;
  tick: number;
}

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.css'],
    standalone: true,
    imports: [MatCardModule, CommonModule],
    animations: [
      trigger('powerActivate', [
        transition('* => active', [
          animate(
            '0.45s ease-out',
            keyframes([
              style({ transform: 'scale(1)', offset: 0 }),
              style({ transform: 'scale(1.45)', offset: 0.35 }),
              style({ transform: 'scale(0.92)', offset: 0.65 }),
              style({ transform: 'scale(1)', offset: 1 }),
            ])
          )
        ])
      ])
    ]
  })
export class CardComponent implements OnInit, OnChanges {

  @Input() card?: Card;
  @Input() show: string = 'front';
  @Input() health?: number;
  @Input() attack?: number;
  @Input() inMatch = false;
  @Input() powerPulse?: PowerPulse;
  @Input() statFlashTick = 0;

  beautifulBackUrl = 'https://i.pinimg.com/236x/3c/73/0d/3c730d6df70700a3c912a3c87d6d2027.jpg';

  powerAnimationState: string[] = [];
  powersToShow: CardPower[] = [];
  attackFlash = false;
  healthFlash = false;

  constructor() { }

  ngOnInit() {
    this.syncPowers();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['card']) {
      this.syncPowers();
    }

    if (changes['powerPulse']?.currentValue) {
      this.animatePowerIcon(changes['powerPulse'].currentValue.powerId);
    }

    if (changes['statFlashTick'] && !changes['statFlashTick'].firstChange) {
      this.flashStats();
      return;
    }

    if (!this.inMatch) {
      return;
    }

    if (changes['health'] && !changes['health'].firstChange) {
      this.healthFlash = true;
      this.resetStatFlash();
    }

    if (changes['attack'] && !changes['attack'].firstChange) {
      this.attackFlash = true;
      this.resetStatFlash();
    }
  }

  get displayAttack(): number {
    if (this.inMatch) {
      return this.attack ?? this.card?.attack ?? 0;
    }
    return this.card?.attack ?? 0;
  }

  get displayHealth(): number {
    if (this.inMatch) {
      return this.health ?? this.card?.health ?? 0;
    }
    return this.card?.health ?? 0;
  }

  onCardClick() {
    if (this.inMatch) {
      return;
    }

    this.powerAnimationState = new Array(this.powersToShow.length).fill('');

    this.powersToShow.forEach((_, index) => {
      setTimeout(() => {
        this.powerAnimationState[index] = 'active';
        setTimeout(() => {
          this.powerAnimationState[index] = '';
        }, 500);
      }, index * 600);
    });
  }

  private syncPowers() {
    this.powersToShow = this.card?.cardPowers ?? [];
    this.powerAnimationState = new Array(this.powersToShow.length).fill('');
  }

  private animatePowerIcon(powerId: number) {
    const index = this.powersToShow.findIndex(cp =>
      (cp.powerId ?? cp.power?.id) === powerId
    );
    if (index < 0) {
      return;
    }

    this.powerAnimationState[index] = '';
    setTimeout(() => {
      this.powerAnimationState[index] = 'active';
      setTimeout(() => {
        this.powerAnimationState[index] = '';
      }, 500);
    }, 0);
  }

  private flashStats() {
    this.attackFlash = true;
    this.healthFlash = true;
    this.resetStatFlash();
  }

  private resetStatFlash() {
    setTimeout(() => {
      this.attackFlash = false;
      this.healthFlash = false;
    }, 600);
  }
}
