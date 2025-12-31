import '../../data/models/visit.dart';
import '../../core/utils/formatters.dart';
import '../../core/constants/ar_text.dart';
import 'package:sunmi_printer_plus/sunmi_printer_plus.dart';

/// Printer Service for Sunmi V2 SE 58mm Thermal Receipt Printing
///
/// This service uses Sunmi printer to print visitor receipts.
/// Works only on Android devices with Sunmi printers.
class PrinterService {
  /// Initialize the printer
  /// Call this before printing to ensure printer is ready
  Future<bool> initPrinter() async {
    try {
      // Try to print a test to verify printer is available
      // The printer will throw an error if not available
      await SunmiPrinter.printText('', style: SunmiTextStyle());
      return true;
    } catch (e) {
      print('❌ Printer initialization error: $e');
      print('⚠️ Make sure the Sunmi printer is connected and powered on');
      return false;
    }
  }

  /// Print visit receipt
  ///
  /// Prints a formatted visitor pass receipt on Sunmi printer
  Future<void> printVisitReceipt(Visit visit) async {
    try {
      // Initialize printer
      final isReady = await initPrinter();
      if (!isReady) {
        throw 'Printer not available. Please check printer connection.';
      }

      // Print header (Arabic)
      await SunmiPrinter.printText(
        ArText.visitorPass,
        style: SunmiTextStyle(
          bold: true,
          align: SunmiPrintAlign.CENTER,
        ),
      );

      await SunmiPrinter.lineWrap(1);

      // Print divider line
      await SunmiPrinter.printText(
        '═══════════════════════',
        style: SunmiTextStyle(align: SunmiPrintAlign.CENTER),
      );

      await SunmiPrinter.lineWrap(1);

      // Print visit number (Arabic)
      await SunmiPrinter.printText(
        '${ArText.visitNumberLabel}:',
        style: SunmiTextStyle(align: SunmiPrintAlign.LEFT),
      );
      await SunmiPrinter.printText(
        visit.visitNumber,
        style: SunmiTextStyle(
          bold: true,
          align: SunmiPrintAlign.CENTER,
        ),
      );

      await SunmiPrinter.lineWrap(1);

      // Print visitor information (Arabic)
      await SunmiPrinter.printText(
        '${ArText.visitorLabel}: ${visit.visitorName}',
        style: SunmiTextStyle(align: SunmiPrintAlign.LEFT),
      );

      await SunmiPrinter.lineWrap(1);

      await SunmiPrinter.printText(
        '${ArText.departmentLabel}: ${visit.departmentName}',
        style: SunmiTextStyle(align: SunmiPrintAlign.LEFT),
      );

      await SunmiPrinter.lineWrap(1);

      await SunmiPrinter.printText(
        '${ArText.employeeLabel}: ${visit.employeeToVisit}',
        style: SunmiTextStyle(align: SunmiPrintAlign.LEFT),
      );

      await SunmiPrinter.lineWrap(1);

      // Print check-in time (Arabic)
      await SunmiPrinter.printText(
        '${ArText.checkInLabel}: ${Formatters.formatDateTimeForDisplay(visit.checkInAt)}',
        style: SunmiTextStyle(align: SunmiPrintAlign.LEFT),
      );

      // Print check-out time if available (Arabic)
      if (visit.checkOutAt != null) {
        await SunmiPrinter.lineWrap(1);
        await SunmiPrinter.printText(
          '${ArText.checkOutLabel}: ${Formatters.formatDateTimeForDisplay(visit.checkOutAt!)}',
          style: SunmiTextStyle(align: SunmiPrintAlign.LEFT),
        );
      }

      // Print car plate if available (Arabic)
      if (visit.carPlate != null && visit.carPlate!.isNotEmpty) {
        await SunmiPrinter.lineWrap(1);
        await SunmiPrinter.printText(
          '${ArText.carPlateLabel}: ${visit.carPlate}',
          style: SunmiTextStyle(align: SunmiPrintAlign.LEFT),
        );
      }

      // Print expected duration if available (Arabic)
      if (visit.expectedDurationHours != null) {
        await SunmiPrinter.lineWrap(1);
        await SunmiPrinter.printText(
          '${ArText.durationLabel}: ${visit.expectedDurationHours} ${ArText.hours}',
          style: SunmiTextStyle(align: SunmiPrintAlign.LEFT),
        );
      }

      await SunmiPrinter.lineWrap(1);

      // Print status (Arabic)
      final statusText = visit.status == 'checkedin' ? ArText.active : ArText.completed;
      await SunmiPrinter.printText(
        '${ArText.status}: $statusText',
        style: SunmiTextStyle(
          bold: true,
          align: SunmiPrintAlign.CENTER,
        ),
      );

      await SunmiPrinter.lineWrap(1);

      // Print divider line
      await SunmiPrinter.printText(
        '═══════════════════════',
        style: SunmiTextStyle(align: SunmiPrintAlign.CENTER),
      );

      await SunmiPrinter.lineWrap(1);

      // Print QR code with visit number
      await SunmiPrinter.printQRCode(
        visit.visitNumber,
        style: SunmiQrcodeStyle(
          qrcodeSize: 3,
          errorLevel: SunmiQrcodeLevel.LEVEL_H,
        ),
      );

      await SunmiPrinter.lineWrap(2);

      // Print footer (Arabic)
      await SunmiPrinter.printText(
        ArText.thankYou,
        style: SunmiTextStyle(
          align: SunmiPrintAlign.CENTER,
        ),
      );

      await SunmiPrinter.lineWrap(3);

      // Cut paper
      await SunmiPrinter.cutPaper();

      print('✅ Receipt printed successfully');
    } catch (e) {
      print('❌ Print error: $e');
      rethrow;
    }
  }

  /// Print a simple test receipt
  /// Useful for testing printer functionality
  Future<void> printTestReceipt() async {
    try {
      await initPrinter();

      await SunmiPrinter.printText(
        'PRINTER TEST',
        style: SunmiTextStyle(
          bold: true,
          align: SunmiPrintAlign.CENTER,
        ),
      );

      await SunmiPrinter.lineWrap(2);

      await SunmiPrinter.printText(
        'This is a test print',
        style: SunmiTextStyle(align: SunmiPrintAlign.CENTER),
      );

      await SunmiPrinter.lineWrap(2);

      await SunmiPrinter.printText(
        'Date: ${Formatters.formatDateTimeForDisplay(DateTime.now())}',
        style: SunmiTextStyle(align: SunmiPrintAlign.LEFT),
      );

      await SunmiPrinter.lineWrap(3);

      await SunmiPrinter.cutPaper();

      print('✅ Test receipt printed');
    } catch (e) {
      print('❌ Test print error: $e');
      rethrow;
    }
  }
}
