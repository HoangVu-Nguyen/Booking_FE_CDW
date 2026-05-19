import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { RouterOutlet } from '@angular/router';
import { SearchOverlay } from '../../shared/components/search-overlay/search-overlay';
@Component({
  selector: 'app-main-layout',
  imports: [Header,Footer,RouterOutlet,SearchOverlay],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {}
