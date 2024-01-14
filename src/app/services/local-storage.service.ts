import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly historyKey = 'calculator_history';

  constructor() {}

  // Metode untuk menyimpan data perhitungan ke local storage
  addToHistory(expression: string, result: string): void {
    const history = this.getHistory() || [];
    history.push({ expression, result, timestamp: new Date().toISOString() });
    this.setItem(this.historyKey, history);
  }

  // Metode untuk mengambil semua data perhitungan dari local storage
  getHistory(): any[] {
    return this.getItem(this.historyKey) || [];
  }

  // Metode untuk menghapus semua data perhitungan dari local storage
  clearHistory(): void {
    this.removeItem(this.historyKey);
  }

  // Metode untuk menghapus satu entri data perhitungan dari local storage
  removeFromHistory(index: number): void {
    const history = this.getHistory();
    if (history && index >= 0 && index < history.length) {
      history.splice(index, 1);
      this.setItem(this.historyKey, history);
    }
  }

  private setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private getItem(key: string): any {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  private removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}
