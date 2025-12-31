import 'package:flutter/foundation.dart';
import '../../data/models/visit.dart';
import '../../data/services/visits_api.dart';

/// Visits Provider
/// Manages visits state
class VisitsProvider with ChangeNotifier {
  final VisitsApi _visitsApi;
  List<Visit> _activeVisits = [];
  bool _isLoading = false;
  String? _errorMessage;

  VisitsProvider(this._visitsApi);

  List<Visit> get activeVisits => _activeVisits;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  /// Load active visits
  Future<void> loadActiveVisits({String? search}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _activeVisits = await _visitsApi.getActiveVisits(search: search);
      _isLoading = false;
      _errorMessage = null;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
    }
  }

  /// Checkout a visit
  Future<bool> checkoutVisit(String visitNumber) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _visitsApi.checkoutVisit(visitNumber);
      // Reload active visits
      await loadActiveVisits();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}

