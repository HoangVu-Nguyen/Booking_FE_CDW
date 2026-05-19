import { Component, inject } from '@angular/core';
import { SearchOverlay } from '../../../../shared/components/search-overlay/search-overlay';
import { SearchUiService } from '../../../../core/services/search/search-ui.service';
@Component({
  selector: 'app-search-bar',
  imports: [SearchOverlay],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  private searchUi = inject(SearchUiService);

  // Gọi hàm này khi khách click vào ô tìm kiếm trên Header
  public triggerSearch() {
    this.searchUi.openSearch();
  }
}
