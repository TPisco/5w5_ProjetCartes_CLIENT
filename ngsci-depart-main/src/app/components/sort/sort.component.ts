import { AfterViewChecked, Component, Input, OnInit } from '@angular/core';
import { Card } from 'src/app/models/models';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgForOf } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '../card/card.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-sort',
  standalone: true,
  imports: [RouterModule, CardComponent ,RouterOutlet, FormsModule, CommonModule, MatCardModule, CardComponent, SortComponent, SortComponent, MatSelectModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './sort.component.html',
  styleUrl: './sort.component.css'
})
export class SortComponent implements OnInit {


  @Input() cards: Card[] = []; // decorate the property with @Input()


  // sortedCards: Card[] = [...this.cards];
  sortProperty: keyof Card = 'attack';
  sortOrderProperty: 'attack' | 'health' | 'cost' = 'attack';
  sortOrder: 'asc' | 'desc' = 'asc';

  constructor(private api: ApiService) { }

  async ngOnInit() {
    this.cards = await this.api.getAllCards();





    // this.sortedCards = [...this.cards];
    this.onSortPropertyChange('attack');
    this.onSortOrderChange('asc');
    this.sortCards();

  }

  onSortPropertyChange(event: any) {
    // console.log(event);
    this.sortProperty = event;


    this.sortCards();
  }

  onSortOrderChange(event: any) {
    // console.log(event);
    this.sortOrder = event;
    this.sortCards();
  }

  sortCards() {

    this.cards = [...this.cards].sort((a, b) => {
      if (a[this.sortProperty] < b[this.sortProperty]) {
        console.log(this.cards)
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (a[this.sortProperty] > b[this.sortProperty]) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

}
