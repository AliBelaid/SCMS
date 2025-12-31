import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_styles.dart';
import '../../../core/constants/ar_text.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../data/services/api_client.dart';
import '../../../data/services/visitors_api.dart';
import '../../../data/models/visitor.dart';
import '../../../data/services/local_database.dart';

/// Visitor Search Screen
/// Search for visitors by National ID or Phone via API
class VisitorSearchScreen extends StatefulWidget {
  const VisitorSearchScreen({super.key});

  @override
  State<VisitorSearchScreen> createState() => _VisitorSearchScreenState();
}

class _VisitorSearchScreenState extends State<VisitorSearchScreen> {
  final _searchController = TextEditingController();
  final _localDb = LocalDatabase();
  List<Visitor> _searchResults = [];
  bool _isSearching = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _performSearch(String query) async {
    if (query.trim().isEmpty) {
      setState(() {
        _searchResults = [];
      });
      return;
    }

    setState(() {
      _isSearching = true;
    });

    try {
      print('🔍 VisitorSearch: Starting search for: ${query.trim()}');
      final apiClient = ApiClient();
      final visitorsApi = VisitorsApi(apiClient);

      final trimmedQuery = query.trim();

      // First try the new search endpoint (supports name, ID, phone, company)
      List<Visitor> searchResults = [];
      try {
        print('🔍 VisitorSearch: Trying API search endpoint...');
        searchResults = await visitorsApi.searchVisitors(trimmedQuery);
        print(
          '✅ VisitorSearch: API search found ${searchResults.length} results',
        );
      } catch (e) {
        print('⚠️ VisitorSearch: API search failed, trying lookup: $e');

        // Fallback to lookup if search fails (for exact National ID or Phone match)
        final isNumeric = RegExp(r'^\d+$').hasMatch(trimmedQuery);
        if (isNumeric) {
          // Try as National ID first, then as Phone
          try {
            final visitor = await visitorsApi.lookupVisitor(
              nationalId: trimmedQuery,
            );
            if (visitor != null) {
              searchResults = [visitor];
              print('✅ VisitorSearch: Found by National ID');
            }
          } catch (e) {
            print('⚠️ VisitorSearch: National ID lookup failed: $e');
          }

          if (searchResults.isEmpty) {
            try {
              final visitor = await visitorsApi.lookupVisitor(
                phone: trimmedQuery,
              );
              if (visitor != null) {
                searchResults = [visitor];
                print('✅ VisitorSearch: Found by Phone');
              }
            } catch (e) {
              print('⚠️ VisitorSearch: Phone lookup failed: $e');
            }
          }
        } else {
          // Try as phone (might have + or spaces)
          final phoneOnly = trimmedQuery.replaceAll(RegExp(r'[^\d]'), '');
          if (phoneOnly.isNotEmpty && phoneOnly.length >= 8) {
            try {
              final visitor = await visitorsApi.lookupVisitor(phone: phoneOnly);
              if (visitor != null) {
                searchResults = [visitor];
                print('✅ VisitorSearch: Found by Phone (cleaned)');
              }
            } catch (e) {
              print('⚠️ VisitorSearch: Phone lookup (cleaned) failed: $e');
            }
          }
        }
      }

      if (mounted) {
        setState(() {
          _searchResults = searchResults;
          _isSearching = false;
        });

        if (searchResults.isEmpty) {
          print(
            '🔍 VisitorSearch: No visitors found, trying local database...',
          );
          // Try local database as fallback
          try {
            final localResults = await _localDb.searchVisitors(trimmedQuery);
            print('🔍 VisitorSearch: Local DB results: ${localResults.length}');
            if (localResults.isNotEmpty) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    '${ArText.searchVisitors}: ${ArText.noActiveVisitsFound}',
                  ),
                  backgroundColor: AppColors.warning,
                ),
              );
            }
          } catch (e) {
            print('🔍 VisitorSearch: Local DB error: $e');
          }
        } else {
          print('✅ VisitorSearch: Found ${searchResults.length} visitor(s)');
        }
      }
    } catch (e) {
      print('❌ VisitorSearch: Error during search: $e');
      if (mounted) {
        setState(() {
          _isSearching = false;
        });

        // Show error message
        final errorMsg = e
            .toString()
            .replaceAll('Exception: ', '')
            .replaceAll('Error: ', '');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${ArText.error}: $errorMsg'),
            backgroundColor: AppColors.error,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }
  }

  String _getImageUrl(String? imagePath) {
    if (imagePath == null || imagePath.isEmpty) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return '${ApiEndpoints.baseUrl.replaceAll('/api', '')}$imagePath';
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final screenWidth = size.width;

    return Directionality(
      textDirection: TextDirection.rtl, // Force RTL for Arabic
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text(ArText.searchVisitors, style: AppStyles.heading3),
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
        ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: EdgeInsets.all(screenWidth * 0.03),
            child: TextField(
              controller: _searchController,
              style: AppStyles.bodyLarge,
              decoration:
                  AppStyles.inputDecoration(
                    '${ArText.search} ${ArText.visitor} (الاسم / ${ArText.nationalId} / ${ArText.phone})',
                  ).copyWith(
                    suffixIcon: _isSearching
                        ? const Padding(
                            padding: EdgeInsets.all(12.0),
                            child: SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                          )
                        : IconButton(
                            icon: const Icon(Icons.search),
                            onPressed: () =>
                                _performSearch(_searchController.text),
                          ),
                  ),
              onChanged: (value) {
                if (value.length >= 3) {
                  _performSearch(value);
                } else {
                  setState(() {
                    _searchResults = [];
                  });
                }
              },
              onSubmitted: _performSearch,
            ),
          ),

          // Results
          Expanded(
            child: _searchResults.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.search,
                          size: 64,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _searchController.text.isEmpty
                              ? '${ArText.search} ${ArText.visitor}'
                              : ArText.noActiveVisitsFound,
                          style: AppStyles.bodyLarge.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: EdgeInsets.all(screenWidth * 0.03),
                    itemCount: _searchResults.length,
                    itemBuilder: (context, index) {
                      final visitor = _searchResults[index];
                      return _VisitorCard(
                        visitor: visitor,
                        getImageUrl: _getImageUrl,
                        screenWidth: screenWidth,
                        onTap: () {
                          // Return visitor to previous screen for selection
                          Navigator.pop(context, visitor);
                        },
                        onViewProfile: () {
                          Navigator.pushNamed(
                            context,
                            '/visitor-profile',
                            arguments: visitor.id,
                          );
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
      ),
    );
  }
}

class _VisitorCard extends StatelessWidget {
  final Visitor visitor;
  final String Function(String?) getImageUrl;
  final VoidCallback onTap;
  final VoidCallback onViewProfile;
  final double screenWidth;

  const _VisitorCard({
    required this.visitor,
    required this.getImageUrl,
    required this.onTap,
    required this.onViewProfile,
    required this.screenWidth,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.only(bottom: screenWidth * 0.03),
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Row(
            children: [
              // Visitor image or placeholder
              Container(
                width: screenWidth * 0.12,
                height: screenWidth * 0.12,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(30),
                ),
                child:
                    visitor.personImageUrl != null &&
                        visitor.personImageUrl!.isNotEmpty
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(25),
                        child: Image.network(
                          getImageUrl(visitor.personImageUrl),
                          width: screenWidth * 0.12,
                          height: screenWidth * 0.12,
                          fit: BoxFit.cover,
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return const Center(
                              child: SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              ),
                            );
                          },
                          errorBuilder: (context, error, stackTrace) =>
                              const Center(
                                child: Icon(
                                  Icons.person,
                                  size: 24,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                        ),
                      )
                    : const Icon(
                        Icons.person,
                        size: 24,
                        color: AppColors.primary,
                      ),
              ),
              SizedBox(width: screenWidth * 0.03),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            visitor.fullName,
                            style: AppStyles.heading3,
                          ),
                        ),
                        if (visitor.isBlocked)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.error.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.block,
                                  size: 14,
                                  color: AppColors.error,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  ArText.isBlocked,
                                  style: AppStyles.bodySmall.copyWith(
                                    color: AppColors.error,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        IconButton(
                          icon: const Icon(Icons.info_outline),
                          onPressed: onViewProfile,
                          tooltip: ArText.viewProfile,
                        ),
                      ],
                    ),
                    if (visitor.nationalId != null &&
                        visitor.nationalId!.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        '${ArText.visitNumber}: ${visitor.nationalId}',
                        style: AppStyles.bodySmall,
                      ),
                    ],
                    if (visitor.phone != null && visitor.phone!.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        '${ArText.phone}: ${visitor.phone}',
                        style: AppStyles.bodySmall,
                      ),
                    ],
                    if (visitor.company != null &&
                        visitor.company!.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        '${ArText.company}: ${visitor.company}',
                        style: AppStyles.bodySmall,
                      ),
                    ],
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.textSecondary),
            ],
          ),
        ),
      ),
    );
  }
}
