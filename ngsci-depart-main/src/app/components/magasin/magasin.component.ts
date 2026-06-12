import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { Pack } from 'src/app/models/models';
import { PackOpenDialogComponent } from './pack-open-dialog.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-magasin',
  templateUrl: './magasin.component.html',
  styleUrls: ['./magasin.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, MatCardModule, MatButtonModule, MatDialogModule]
})
export class MagasinComponent implements OnInit, OnDestroy {
  packs: Pack[] = [];
  gold = 0;
  errorMessage = '';
  private goldSub?: Subscription;

  constructor(public service: ApiService, private dialog: MatDialog) { }

  async ngOnInit() {
    this.packs = await this.service.getPacks();
    this.goldSub = this.service.gold$.subscribe(value => {
      this.gold = value;
    });
    if (sessionStorage.getItem('token')) {
      await this.service.refreshGold();
    }
  }

  ngOnDestroy(): void {
    this.goldSub?.unsubscribe();
  }

  async buyPack(pack: Pack) {
    this.errorMessage = '';
    if (this.gold < pack.price) {
      this.errorMessage = 'Pas assez de gold pour acheter ce paquet.';
      return;
    }
    try {
      const result = await this.service.buyPack(pack.id);
      this.dialog.open(PackOpenDialogComponent, {
        width: '760px',
        panelClass: 'pokemon-dialog',
        data: result
      });
    } catch (err: any) {
      this.errorMessage = err?.error?.message ?? 'Achat impossible.';
    }
  }
}
