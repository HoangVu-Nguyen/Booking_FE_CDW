import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, startWith, switchMap, of, debounceTime } from 'rxjs';
import { SearchUiService } from '../../../core/services/search/search-ui.service';
import { SearchApiService } from '../../../core/services/search/search-api.service';
import { RouterModule } from '@angular/router';
import { RouterLink } from '@angular/router';
// Định nghĩa kiểu cho Form Amenities
interface AmenitiesForm {
  pool: FormControl<boolean | null>;
  kitchen: FormControl<boolean | null>;
  gym: FormControl<boolean | null>;
  beachfront: FormControl<boolean | null>;
}

@Component({
  selector: 'app-search-overlay',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './search-overlay.html'
})
export class SearchOverlay implements OnInit {
  public searchUi = inject(SearchUiService);
  private searchApi = inject(SearchApiService);
  
  public searchResults = signal<any[]>([]);
  public isSearching = signal<boolean>(false);
  public isDefaultState = signal<boolean>(true); 

  public searchControl = new FormControl<string>('');
  
  public filterForm = new FormGroup({
    category: new FormControl<string>('ALL'),
    maxPrice: new FormControl<number>(9000000),
    guests: new FormControl<number>(0),
    bedrooms: new FormControl<number>(0),
    minRating: new FormControl<number>(0),
    amenities: new FormGroup<AmenitiesForm>({
      pool: new FormControl(false),
      kitchen: new FormControl(false),
      gym: new FormControl(false),
      beachfront: new FormControl(false)
    })
  });

  ngOnInit() {
    combineLatest([
      this.searchControl.valueChanges.pipe(startWith('')),
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.getRawValue()))
    ]).pipe(
      debounceTime(400),
      switchMap(([keyword, filters]) => {
        // Logic kiểm tra trạng thái mặc định
        const isDefault = !keyword && 
                          filters.maxPrice === 899999 && 
                          filters.category === 'ALL' && 
                          filters.guests === 0 && 
                          filters.bedrooms === 0;
        
        if (isDefault) {
          this.isDefaultState.set(true);
          return of({ data: [] });
        }

        this.isDefaultState.set(false);
        this.isSearching.set(true);
        console.log('Search Params:', { keyword, ...filters, amenityIds: this.extractAmenityIds(filters.amenities) });

        return this.searchApi.search({
          keyword,
          ...filters,
          amenityIds: this.extractAmenityIds(filters.amenities)
        });
      })
    ).subscribe({
      next: (res) => {
        console.log('Search Results:', res);
        this.searchResults.set(res.data || []);
        this.isSearching.set(false);
      },
      error: () => this.isSearching.set(false)
    });
  }

  private extractAmenityIds(amenities: any): number[] {
    if (!amenities) return [];
    const map: Record<string, number> = { pool: 1, beachfront: 2, kitchen: 3, gym: 4 };
    return Object.entries(amenities)
      .filter(([_, checked]) => checked === true)
      .map(([key, _]) => map[key] || 0)
      .filter(id => id > 0);
  }

  // --- UI Helpers ---
  updateCounter(field: 'guests' | 'bedrooms', delta: number) {
    const control = this.filterForm.get(field);
    if (control) control.setValue(Math.max(0, (control.value || 0) + delta));
  }

  setQuickSearch(k: string) { this.searchControl.setValue(k); }
  clearSearch() { this.searchControl.setValue(''); }
  resetFilters() { 
    this.filterForm.reset({ 
      category: 'ALL', maxPrice: 9000000, guests: 0, bedrooms: 0, minRating: 0 
    }); 
  }
  close() { this.searchUi.closeSearch(); }
}