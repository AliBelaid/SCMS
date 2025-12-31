import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../widgets/pos_button.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_styles.dart';
import '../../../core/constants/ar_text.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../data/services/api_client.dart';
import '../../../data/services/visitors_api.dart';
import '../../../data/models/visitor.dart';
import '../../../core/utils/formatters.dart';
import '../../../presentation/providers/auth_provider.dart';

/// Visitor Profile Screen
/// Shows visitor details, history, and images from API
class VisitorProfileScreen extends StatefulWidget {
  final int visitorId;

  const VisitorProfileScreen({super.key, required this.visitorId});

  @override
  State<VisitorProfileScreen> createState() => _VisitorProfileScreenState();
}

class _VisitorProfileScreenState extends State<VisitorProfileScreen> {
  Map<String, dynamic>? _profileData;
  Visitor? _visitor;
  List<dynamic>? _recentVisits;
  bool _isLoading = true;
  bool _isUpdatingBlock = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadVisitorProfile();
  }

  Future<void> _loadVisitorProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      print('👤 VisitorProfile: Loading profile for visitor ID: ${widget.visitorId}');
      final apiClient = ApiClient();
      final visitorsApi = VisitorsApi(apiClient);
      final profileData = await visitorsApi.getVisitorProfile(widget.visitorId);
      print('✅ VisitorProfile: Profile data loaded: ${profileData.keys}');

      if (mounted) {
        setState(() {
          _profileData = profileData;
          _visitor = Visitor.fromJson(
            profileData['visitor'] as Map<String, dynamic>,
          );
          _recentVisits = profileData['recentVisits'] as List<dynamic>?;
          _isLoading = false;
        });
        print('✅ VisitorProfile: Visitor loaded: ${_visitor?.fullName}, Recent visits: ${_recentVisits?.length ?? 0}');
      }
    } catch (e) {
      print('❌ VisitorProfile: Error loading profile: $e');
      if (mounted) {
        final errorMsg = e.toString().replaceAll('Exception: ', '').replaceAll('Error: ', '');
        setState(() {
          _errorMessage = errorMsg;
          _isLoading = false;
        });
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

  bool _isAdmin() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    return authProvider.currentUser?.role.toLowerCase() == 'admin';
  }

  Future<void> _toggleBlockStatus() async {
    if (_visitor == null) return;

    final isCurrentlyBlocked = _visitor!.isBlocked;
    final confirmMessage = isCurrentlyBlocked
        ? ArText.unblockVisitorMessage
        : ArText.blockVisitorMessage;
    final confirmTitle = isCurrentlyBlocked
        ? ArText.confirmUnblock
        : ArText.confirmBlock;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(confirmTitle),
        content: Text(confirmMessage),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(ArText.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(ArText.confirm),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() {
      _isUpdatingBlock = true;
    });

    try {
      final apiClient = ApiClient();
      final visitorsApi = VisitorsApi(apiClient);
      final updatedVisitor = await visitorsApi.updateVisitorBlockedStatus(
        _visitor!.id,
        !isCurrentlyBlocked,
      );

      if (mounted) {
        setState(() {
          _visitor = updatedVisitor;
          _isUpdatingBlock = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              isCurrentlyBlocked
                  ? ArText.unblockSuccess
                  : ArText.blockSuccess,
            ),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isUpdatingBlock = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${ArText.blockFailed}: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Map<String, dynamic>? _getLastVisit() {
    if (_recentVisits == null || _recentVisits!.isEmpty) return null;
    return _recentVisits!.first as Map<String, dynamic>;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text(ArText.visitor, style: AppStyles.heading3),
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_errorMessage != null || _visitor == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text(ArText.visitor, style: AppStyles.heading3),
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.error),
              const SizedBox(height: 16),
              Text(
                _errorMessage ?? ArText.error,
                style: AppStyles.bodyLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              PosButton(
                text: ArText.back,
                icon: Icons.arrow_back,
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(ArText.visitor, style: AppStyles.heading3),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: RefreshIndicator(
        onRefresh: _loadVisitorProfile,
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.all(12.0),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
              // Blocked Status Banner
              if (_visitor!.isBlocked)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.error.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.error),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.block, color: AppColors.error),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          '${ArText.visitor} ${ArText.isBlocked}',
                          style: AppStyles.heading3.copyWith(
                            color: AppColors.error,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              if (_visitor!.isBlocked) const SizedBox(height: 12),

              // Visitor Image
              Center(
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(60),
                    border: Border.all(color: AppColors.primary, width: 3),
                  ),
                  child:
                      _visitor!.personImageUrl != null &&
                          _visitor!.personImageUrl!.isNotEmpty
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(47),
                          child: Image.network(
                            _getImageUrl(_visitor!.personImageUrl),
                            width: 100,
                            height: 100,
                            fit: BoxFit.cover,
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return Center(
                                child: CircularProgressIndicator(
                                  value: loadingProgress.expectedTotalBytes != null
                                      ? loadingProgress.cumulativeBytesLoaded /
                                          loadingProgress.expectedTotalBytes!
                                      : null,
                                  strokeWidth: 2,
                                ),
                              );
                            },
                            errorBuilder: (context, error, stackTrace) =>
                                const Center(
                                  child: Icon(
                                    Icons.person,
                                    size: 50,
                                    color: AppColors.primary,
                                  ),
                                ),
                          ),
                        )
                      : const Icon(
                          Icons.person,
                          size: 50,
                          color: AppColors.primary,
                        ),
                ),
              ),
              const SizedBox(height: 16),

              // Visitor Info Card
              Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_visitor!.fullName, style: AppStyles.heading1),
                      const SizedBox(height: 12),
                      _InfoRow(
                        label: ArText.nationalId,
                        value: _visitor!.nationalId,
                      ),
                      _InfoRow(label: ArText.phone, value: _visitor!.phone),
                      _InfoRow(label: ArText.company, value: _visitor!.company),
                      const Divider(height: 32),
                      _InfoRow(
                        label: ArText.totalVisitsLabel,
                        value: '${_profileData?['totalVisits'] ?? 0}',
                      ),
                      // Last Visit Info
                      if (_getLastVisit() != null) ...[
                        const Divider(height: 32),
                        Text(
                          ArText.lastVisit,
                          style: AppStyles.heading3,
                        ),
                        const SizedBox(height: 12),
                        _InfoRow(
                          label: ArText.department,
                          value: _getLastVisit()!['departmentName'] as String?,
                        ),
                        _InfoRow(
                          label: ArText.employee,
                          value: _getLastVisit()!['employeeToVisit'] as String?,
                        ),
                        _InfoRow(
                          label: ArText.checkInTime,
                          value: _getLastVisit()!['checkInAt'] != null
                              ? Formatters.formatDateTimeForDisplay(
                                  DateTime.parse(
                                    _getLastVisit()!['checkInAt'] as String,
                                  ),
                                )
                              : null,
                        ),
                        if (_getLastVisit()!['checkOutAt'] != null)
                          _InfoRow(
                            label: ArText.checkOutTime,
                            value: Formatters.formatDateTimeForDisplay(
                              DateTime.parse(
                                _getLastVisit()!['checkOutAt'] as String,
                              ),
                            ),
                          ),
                        _InfoRow(
                          label: ArText.status,
                          value: _getLastVisit()!['status'] as String?,
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Block/Unblock Button (Admin only)
              if (_isAdmin())
                Card(
                  elevation: 2,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          _visitor!.isBlocked
                              ? ArText.unblockVisitor
                              : ArText.blockVisitor,
                          style: AppStyles.heading3,
                        ),
                        const SizedBox(height: 16),
                        PosButton(
                          text: _visitor!.isBlocked
                              ? ArText.unblockVisitor
                              : ArText.blockVisitor,
                          icon: _visitor!.isBlocked
                              ? Icons.check_circle
                              : Icons.block,
                          isDanger: !_visitor!.isBlocked,
                          isPrimary: _visitor!.isBlocked,
                          isLoading: _isUpdatingBlock,
                          onPressed: _isUpdatingBlock ? null : _toggleBlockStatus,
                        ),
                      ],
                    ),
                  ),
                ),
              if (_isAdmin()) const SizedBox(height: 16),

              // ID Card Image
              if (_visitor!.idCardImageUrl != null &&
                  _visitor!.idCardImageUrl!.isNotEmpty) ...[
                Card(
                  elevation: 2,
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(ArText.idCard, style: AppStyles.heading3),
                        const SizedBox(height: 12),
                        Container(
                          width: double.infinity,
                          constraints: const BoxConstraints(maxHeight: 300),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(
                              _getImageUrl(_visitor!.idCardImageUrl),
                              fit: BoxFit.contain,
                              loadingBuilder: (context, child, loadingProgress) {
                                if (loadingProgress == null) return child;
                                return Center(
                                  child: Padding(
                                    padding: const EdgeInsets.all(32.0),
                                    child: CircularProgressIndicator(
                                      value: loadingProgress.expectedTotalBytes != null
                                          ? loadingProgress.cumulativeBytesLoaded /
                                              loadingProgress.expectedTotalBytes!
                                          : null,
                                    ),
                                  ),
                                );
                              },
                              errorBuilder: (context, error, stackTrace) =>
                                  Center(
                                    child: Padding(
                                      padding: const EdgeInsets.all(32.0),
                                      child: Column(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Icon(
                                            Icons.error_outline,
                                            size: 48,
                                            color: AppColors.error,
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            ArText.error,
                                            style: AppStyles.bodyMedium.copyWith(
                                              color: AppColors.error,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Recent Visits
              if (_recentVisits != null && _recentVisits!.isNotEmpty) ...[
                Text(ArText.recentVisits, style: AppStyles.heading2),
                const SizedBox(height: 12),
                ..._recentVisits!.map(
                  (visit) => Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    elevation: 2,
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: visit['status'] == 'completed'
                            ? AppColors.success
                            : AppColors.warning,
                        child: Icon(
                          visit['status'] == 'completed'
                              ? Icons.check
                              : Icons.access_time,
                          color: Colors.white,
                        ),
                      ),
                      title: Text(
                        visit['visitNumber'] as String,
                        style: AppStyles.bodyLarge,
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${ArText.department}: ${visit['departmentName']}',
                          ),
                          Text(
                            '${ArText.checkInTime}: ${Formatters.formatDateTimeForDisplay(DateTime.parse(visit['checkInAt'] as String))}',
                          ),
                          if (visit['checkOutAt'] != null)
                            Text(
                              '${ArText.checkOutTime}: ${Formatters.formatDateTimeForDisplay(DateTime.parse(visit['checkOutAt'] as String))}',
                            ),
                        ],
                      ),
                      trailing: Text(
                        visit['status'] as String,
                        style: AppStyles.bodySmall.copyWith(
                          color: visit['status'] == 'completed'
                              ? AppColors.success
                              : AppColors.warning,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String? value;

  const _InfoRow({required this.label, this.value});

  @override
  Widget build(BuildContext context) {
    if (value == null || value!.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: AppStyles.bodySmall.copyWith(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(child: Text(value!, style: AppStyles.bodyMedium)),
        ],
      ),
    );
  }
}
