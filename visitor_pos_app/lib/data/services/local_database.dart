import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as path;
import 'dart:convert';

/// Local SQLite Database Service
/// Stores visits locally when offline for later sync
class LocalDatabase {
  static final LocalDatabase _instance = LocalDatabase._internal();
  factory LocalDatabase() => _instance;
  LocalDatabase._internal();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final dbFile = path.join(dbPath, 'visitor_pos.db');

    return await openDatabase(
      dbFile,
      version: 2,
      onCreate: (db, version) async {
        await _createTables(db);
      },
      onUpgrade: (db, oldVersion, newVersion) async {
        if (oldVersion < 2) {
          await _createTables(db);
        }
      },
    );
  }

  Future<void> _createTables(Database db) async {
    // Pending visits table
    await db.execute('''
      CREATE TABLE IF NOT EXISTS pending_visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visit_data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending'
      )
    ''');

    // Synced visits cache table (for offline viewing)
    await db.execute('''
      CREATE TABLE IF NOT EXISTS cached_visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visit_number TEXT UNIQUE NOT NULL,
        visit_data TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    // Departments cache table
    await db.execute('''
      CREATE TABLE IF NOT EXISTS cached_departments (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    // Employees cache table (people working in company)
    await db.execute('''
      CREATE TABLE IF NOT EXISTS cached_employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        department_id INTEGER,
        department_name TEXT,
        updated_at TEXT NOT NULL
      )
    ''');

    // Visitor history table (for tracking visitor records)
    await db.execute('''
      CREATE TABLE IF NOT EXISTS visitor_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visitor_id INTEGER,
        visitor_name TEXT NOT NULL,
        national_id TEXT,
        phone TEXT,
        company TEXT,
        person_image_url TEXT,
        id_card_image_url TEXT,
        last_visit_date TEXT,
        last_department_id INTEGER,
        last_department_name TEXT,
        last_employee_visited TEXT,
        total_visits INTEGER DEFAULT 0,
        last_visit_state TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    // Create indexes
    await db.execute('CREATE INDEX IF NOT EXISTS idx_sync_status ON pending_visits(sync_status)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_visit_number ON cached_visits(visit_number)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_visitor_name ON visitor_history(visitor_name)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_national_id ON visitor_history(national_id)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_phone ON visitor_history(phone)');
  }

  /// Save visit data to pending queue
  Future<int> savePendingVisit(Map<String, dynamic> visitData) async {
    final db = await database;
    return await db.insert(
      'pending_visits',
      {
        'visit_data': jsonEncode(visitData),
        'created_at': DateTime.now().toIso8601String(),
        'sync_status': 'pending',
      },
    );
  }

  /// Get all pending visits
  Future<List<Map<String, dynamic>>> getPendingVisits() async {
    final db = await database;
    final results = await db.query(
      'pending_visits',
      where: 'sync_status = ?',
      whereArgs: ['pending'],
      orderBy: 'created_at ASC',
    );

    return results.map((row) {
      final visitData = jsonDecode(row['visit_data'] as String) as Map<String, dynamic>;
      return {
        'id': row['id'] as int,
        'visit_data': visitData,
        'created_at': row['created_at'] as String,
      };
    }).toList();
  }

  /// Mark visit as synced
  Future<void> markVisitAsSynced(int id) async {
    final db = await database;
    await db.update(
      'pending_visits',
      {'sync_status': 'synced'},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  /// Delete synced visit from pending queue
  Future<void> deletePendingVisit(int id) async {
    final db = await database;
    await db.delete(
      'pending_visits',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  /// Cache a synced visit for offline viewing
  Future<void> cacheVisit(Map<String, dynamic> visitData) async {
    final db = await database;
    await db.insert(
      'cached_visits',
      {
        'visit_number': visitData['visitNumber'] as String,
        'visit_data': jsonEncode(visitData),
        'updated_at': DateTime.now().toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Get cached visits
  Future<List<Map<String, dynamic>>> getCachedVisits({String? search}) async {
    final db = await database;
    List<Map<String, dynamic>> results;

    if (search != null && search.isNotEmpty) {
      results = await db.query(
        'cached_visits',
        where: 'visit_data LIKE ?',
        whereArgs: ['%$search%'],
        orderBy: 'updated_at DESC',
      );
    } else {
      results = await db.query(
        'cached_visits',
        orderBy: 'updated_at DESC',
      );
    }

    return results.map((row) {
      return jsonDecode(row['visit_data'] as String) as Map<String, dynamic>;
    }).toList();
  }

  /// Get count of pending visits
  Future<int> getPendingVisitsCount() async {
    final db = await database;
    final result = await db.rawQuery(
      'SELECT COUNT(*) as count FROM pending_visits WHERE sync_status = ?',
      ['pending'],
    );
    return Sqflite.firstIntValue(result) ?? 0;
  }

  /// Clear old synced visits (older than 7 days)
  Future<void> clearOldSyncedVisits() async {
    final db = await database;
    final sevenDaysAgo = DateTime.now().subtract(const Duration(days: 7)).toIso8601String();
    await db.delete(
      'pending_visits',
      where: 'sync_status = ? AND created_at < ?',
      whereArgs: ['synced', sevenDaysAgo],
    );
  }

  /// Cache departments
  Future<void> cacheDepartments(List<Map<String, dynamic>> departments) async {
    final db = await database;
    final now = DateTime.now().toIso8601String();
    
    await db.delete('cached_departments');
    
    for (final dept in departments) {
      await db.insert(
        'cached_departments',
        {
          'id': dept['id'] as int,
          'name': dept['name'] as String,
          'updated_at': now,
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
  }

  /// Get cached departments
  Future<List<Map<String, dynamic>>> getCachedDepartments() async {
    final db = await database;
    final results = await db.query('cached_departments', orderBy: 'name ASC');
    return results.map((row) => {
      'id': row['id'] as int,
      'name': row['name'] as String,
    }).toList();
  }

  /// Cache employee (person working in company)
  Future<void> cacheEmployee(String name, int? departmentId, String? departmentName) async {
    final db = await database;
    final now = DateTime.now().toIso8601String();
    
    await db.insert(
      'cached_employees',
      {
        'name': name,
        'department_id': departmentId,
        'department_name': departmentName,
        'updated_at': now,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Get cached employees
  Future<List<Map<String, dynamic>>> getCachedEmployees({String? search}) async {
    final db = await database;
    List<Map<String, dynamic>> results;
    
    if (search != null && search.isNotEmpty) {
      results = await db.query(
        'cached_employees',
        where: 'name LIKE ?',
        whereArgs: ['%$search%'],
        orderBy: 'name ASC',
      );
    } else {
      results = await db.query('cached_employees', orderBy: 'name ASC');
    }
    
    return results.map((row) => {
      'name': row['name'] as String,
      'department_id': row['department_id'] as int?,
      'department_name': row['department_name'] as String?,
    }).toList();
  }

  /// Save or update visitor history
  Future<void> saveVisitorHistory({
    int? visitorId,
    required String visitorName,
    String? nationalId,
    String? phone,
    String? company,
    String? personImageUrl,
    String? idCardImageUrl,
    required int departmentId,
    required String departmentName,
    required String employeeVisited,
    String? visitState,
    String? notes,
  }) async {
    final db = await database;
    final now = DateTime.now().toIso8601String();
    
    // Check if visitor exists (by visitor_id first, then by name/ID/phone)
    List<Map<String, dynamic>> existing = [];
    if (visitorId != null) {
      existing = await db.query(
        'visitor_history',
        where: 'visitor_id = ?',
        whereArgs: [visitorId],
        limit: 1,
      );
    }
    
    if (existing.isEmpty) {
      existing = await db.query(
        'visitor_history',
        where: 'visitor_name = ? OR (national_id IS NOT NULL AND national_id = ?) OR (phone IS NOT NULL AND phone = ?)',
        whereArgs: [visitorName, nationalId ?? '', phone ?? ''],
        limit: 1,
      );
    }

    if (existing.isNotEmpty) {
      // Update existing visitor
      final currentTotal = existing.first['total_visits'] as int? ?? 0;
      await db.update(
        'visitor_history',
        {
          'visitor_id': visitorId,
          'national_id': nationalId,
          'phone': phone,
          'company': company,
          'person_image_url': personImageUrl,
          'id_card_image_url': idCardImageUrl,
          'last_visit_date': now,
          'last_department_id': departmentId,
          'last_department_name': departmentName,
          'last_employee_visited': employeeVisited,
          'total_visits': currentTotal + 1,
          'last_visit_state': visitState,
          'notes': notes,
          'updated_at': now,
        },
        where: 'id = ?',
        whereArgs: [existing.first['id']],
      );
    } else {
      // Insert new visitor
      await db.insert(
        'visitor_history',
        {
          'visitor_id': visitorId,
          'visitor_name': visitorName,
          'national_id': nationalId,
          'phone': phone,
          'company': company,
          'person_image_url': personImageUrl,
          'id_card_image_url': idCardImageUrl,
          'last_visit_date': now,
          'last_department_id': departmentId,
          'last_department_name': departmentName,
          'last_employee_visited': employeeVisited,
          'total_visits': 1,
          'last_visit_state': visitState,
          'notes': notes,
          'created_at': now,
          'updated_at': now,
        },
      );
    }
  }

  /// Search visitors
  Future<List<Map<String, dynamic>>> searchVisitors(String query) async {
    final db = await database;
    final results = await db.query(
      'visitor_history',
      where: 'visitor_name LIKE ? OR national_id LIKE ? OR phone LIKE ? OR company LIKE ?',
      whereArgs: ['%$query%', '%$query%', '%$query%', '%$query%'],
      orderBy: 'last_visit_date DESC',
      limit: 50,
    );
    
    return results.map((row) => {
      'id': row['id'] as int,
      'visitor_id': row['visitor_id'] as int?,
      'visitor_name': row['visitor_name'] as String,
      'national_id': row['national_id'] as String?,
      'phone': row['phone'] as String?,
      'company': row['company'] as String?,
      'person_image_url': row['person_image_url'] as String?,
      'id_card_image_url': row['id_card_image_url'] as String?,
      'last_visit_date': row['last_visit_date'] as String?,
      'last_department_id': row['last_department_id'] as int?,
      'last_department_name': row['last_department_name'] as String?,
      'last_employee_visited': row['last_employee_visited'] as String?,
      'total_visits': row['total_visits'] as int? ?? 0,
      'last_visit_state': row['last_visit_state'] as String?,
      'notes': row['notes'] as String?,
    }).toList();
  }

  /// Get visitor by name, national ID, or phone
  Future<Map<String, dynamic>?> getVisitorByIdentifier({
    String? name,
    String? nationalId,
    String? phone,
  }) async {
    final db = await database;
    List<Map<String, dynamic>> results;
    
    if (nationalId != null && nationalId.isNotEmpty) {
      results = await db.query(
        'visitor_history',
        where: 'national_id = ?',
        whereArgs: [nationalId],
        limit: 1,
      );
    } else if (phone != null && phone.isNotEmpty) {
      results = await db.query(
        'visitor_history',
        where: 'phone = ?',
        whereArgs: [phone],
        limit: 1,
      );
    } else if (name != null && name.isNotEmpty) {
      results = await db.query(
        'visitor_history',
        where: 'visitor_name = ?',
        whereArgs: [name],
        limit: 1,
      );
    } else {
      return null;
    }

    if (results.isEmpty) return null;

    final row = results.first;
    return {
      'id': row['id'] as int,
      'visitor_id': row['visitor_id'] as int?,
      'visitor_name': row['visitor_name'] as String,
      'national_id': row['national_id'] as String?,
      'phone': row['phone'] as String?,
      'company': row['company'] as String?,
      'person_image_url': row['person_image_url'] as String?,
      'id_card_image_url': row['id_card_image_url'] as String?,
      'last_visit_date': row['last_visit_date'] as String?,
      'last_department_id': row['last_department_id'] as int?,
      'last_department_name': row['last_department_name'] as String?,
      'last_employee_visited': row['last_employee_visited'] as String?,
      'total_visits': row['total_visits'] as int? ?? 0,
      'last_visit_state': row['last_visit_state'] as String?,
      'notes': row['notes'] as String?,
    };
  }

  /// Update visitor notes/state
  Future<void> updateVisitorNotes(int visitorId, String? notes, String? state) async {
    final db = await database;
    final updates = <String, dynamic>{
      'updated_at': DateTime.now().toIso8601String(),
    };
    
    if (notes != null) {
      updates['notes'] = notes;
    }
    if (state != null) {
      updates['last_visit_state'] = state;
    }
    
    await db.update(
      'visitor_history',
      updates,
      where: 'id = ?',
      whereArgs: [visitorId],
    );
  }

  /// Close database
  Future<void> close() async {
    final db = await database;
    await db.close();
  }
}

