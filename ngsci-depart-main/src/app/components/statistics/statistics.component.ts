import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from 'src/app/services/api.service';
import { CardDistribution, PlayerStats } from 'src/app/models/models';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit {
  playerStats?: PlayerStats;
  distribution?: CardDistribution;
  selectedDeckId: number | null = null;
  errorMessage = '';

  constructor(private api: ApiService) {}

  async ngOnInit() {
    try {
      this.playerStats = await this.api.getPlayerStats();
      await this.loadDistribution();
    } catch {
      this.errorMessage = 'Impossible de charger les statistiques.';
    }
  }

  async loadDistribution() {
    this.distribution = await this.api.getCardDistribution(this.selectedDeckId ?? undefined);
  }

  async onDeckChange() {
    await this.loadDistribution();
  }

  maxCount(points: { count: number }[] | undefined): number {
    if (!points?.length) return 1;
    return Math.max(...points.map(p => p.count), 1);
  }
}
