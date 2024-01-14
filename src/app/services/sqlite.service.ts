import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SQLiteService {
  db!: SQLiteObject;
  private apiUrl = 'http://192.168.141.136/kalkulator6%20-%20Copy/api.php'; // Ubah sesuai dengan path API kalkulator

  constructor(private sqlite: SQLite, private http: HttpClient) {
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    const dbPath = 'C:\\xamppx\\htdocs\\kalkulator6 - Copy\\calculatorc.db';

    try {
      this.db = await this.sqlite.create({
        name: dbPath,
        location: 'default',
      });

      await this.createTable();
    } catch (error) {
      console.error(error);
    }
  }

  private async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS calculation_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expression TEXT NOT NULL,
        result TEXT NOT NULL,
        timestamp TEXT
      )`;

    try {
      await this.db.executeSql(query, []);
    } catch (error) {
      console.error(error);
    }
  }

  async addCalculation(expression: string, result: string): Promise<void> {
    const query = 'INSERT INTO calculation_history (expression, result, timestamp) VALUES (?, ?, ?)';
    const timestamp = new Date().toISOString();
  
    try {
      await this.db.executeSql(query, [expression, result, timestamp]);
    } catch (error) {
      console.error(error);
    }
  }

  async removeCalculation(index: number): Promise<void> {
    const query = 'DELETE FROM calculation_history WHERE id = ?';

    const history = await this.getHistory();
    const idToDelete = history[index]?.id;

    if (idToDelete) {
      try {
        await this.db.executeSql(query, [idToDelete]);
        await this.syncCalculations(); // Sync with the remote API
      } catch (error) {
        console.error(error);
      }
    }
  }

  async getHistory(): Promise<any[]> {
    const query = 'SELECT * FROM calculation_history';

    try {
      const result = await this.db.executeSql(query, []);
      return result?.rows?.raw() || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async clearHistory(): Promise<void> {
    const query = 'DELETE FROM calculation_history';

    try {
      await this.db.executeSql(query, []);
      await this.syncCalculations(); // Sync with the remote API
    } catch (error) {
      console.error(error);
    }
  }

  async syncCalculations(): Promise<void> {
    const history = await this.getHistory();
  
    if (history.length === 0) {
      // Do not perform synchronization if there are no calculations
      return;
    }
  
    const payloads = history.map(calculation => ({
      expression: calculation.expression,
      result: calculation.result,
    }));
  
    this.http.post(this.apiUrl, { history: payloads }).subscribe(
      (response) => {
        console.log('Calculation history synced successfully', response);
      },
      (error) => {
        console.error('Error syncing calculation history:', error);
      }
    );
  }
  
  
  
}
