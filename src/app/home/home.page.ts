// home.page.ts

import { Component } from '@angular/core';
import { LocalStorageService } from '../services/local-storage.service';
import { SQLiteService } from '../services/sqlite.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  display: string = '';
  buttons: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', '-', '*', '/'];
  history: any[] = [];
  showHistoryModal: boolean = false;
  showHistory: boolean = false;
  showSQLiteHistory: boolean = false;
  sqliteHistory: any[] = [];

  constructor(
    private localStorageService: LocalStorageService,
    private sqliteService: SQLiteService,
    private modalController: ModalController
  ) {
    this.loadHistory();
  }

  async loadHistory(): Promise<void> {
    // Load history from both local storage and SQLite
    const localHistory = this.localStorageService.getHistory();
    const sqliteHistory = await this.sqliteService.getHistory();

    // Combine and remove duplicates based on some identifier (e.g., timestamp or unique ID)
    this.history = this.combineAndRemoveDuplicates(localHistory, sqliteHistory);
    this.sqliteHistory = sqliteHistory;
  }

  onButtonClick(button: string): void {
    this.display += button;
  }

  clearInput(): void {
    this.display = '';
  }

  async calculate(): Promise<void> {
    try {
      const result = eval(this.display);
      if (result !== undefined) {
        this.saveCalculation(this.display, result.toString());
        this.display = result.toString(); // Update display with the result
      } else {
        alert('Invalid calculation');
      }
    } catch (error) {
      alert('Error in calculation');
    }
  }

  saveCalculation(expression: string, result: string): void {
    // Simpan ke dalam Local Storage
    this.localStorageService.addToHistory(expression, result);
    this.history = this.localStorageService.getHistory();

    // Simpan ke dalam SQLite
    this.sqliteService.addCalculation(expression, result);
  }

  clearCalculation(): void {
    this.display = '';
  }

  async clearHistory(): Promise<void> {
    // Clear history from both local storage and SQLite
    this.localStorageService.clearHistory();
    await this.sqliteService.clearHistory();

    // Refresh history from both sources
    this.loadHistory();
  }

  removeItem(index: number): void {
    // Hapus dari Local Storage
    this.localStorageService.removeFromHistory(index);
    this.history = this.localStorageService.getHistory();

    // Hapus dari SQLite
    this.sqliteService.removeCalculation(index);
  }

  viewHistory(): void {
    this.showHistory = !this.showHistory; // Toggle the display of local storage history
    this.showHistoryModal = this.showHistory; // Adjust the display of SQLite history modal
  }

  removeSQLiteItem(index: number): void {
    if (index >= 0 && index < this.sqliteHistory.length) {
      // Hapus item dari sqliteHistory pada indeks tertentu
      this.sqliteHistory.splice(index, 1);
    }
  }

  // Helper function to combine and remove duplicates from two arrays
  private combineAndRemoveDuplicates(array1: any[], array2: any[]): any[] {
    const combinedArray = [...array1, ...array2];

    // Assuming each history entry has a unique identifier (e.g., timestamp or ID)
    const uniqueIdentifiers = new Set(combinedArray.map(entry => entry.timestamp)); // Change 'timestamp' to your unique identifier

    return Array.from(uniqueIdentifiers).map(identifier => {
      return combinedArray.find(entry => entry.timestamp === identifier); // Change 'timestamp' to your unique identifier
    });
  }
}
