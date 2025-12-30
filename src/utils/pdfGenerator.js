import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate, formatTime, formatDistance } from './formatters';
import { PM_APPROVAL_THRESHOLD_KM } from './constants'; 

// Company logo/header configuration
const COMPANY_NAME = 'Ride Management System';
const PRIMARY_COLOR = [37, 99, 235]; // Blue-600
const HEADER_COLOR = [249, 250, 251]; // Gray-50

/**
 * Generate Vehicle Mileage PDF Report
 */
export const generateVehicleMileagePDF = (data, month) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY_NAME, pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Vehicle Mileage Report', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Report Period: ${month}`, pageWidth / 2, 33, { align: 'center' });

    // Summary Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, 50);

    const summary = data.summary || {};
    const summaryData = [
      ['Total Vehicles', String(summary.totalVehicles || 0)],
      ['Active Vehicles', String(summary.activeVehicles || 0)],
      ['Monthly Mileage', formatDistance(summary.monthlyMileage || 0)],
      ['Total Mileage', formatDistance(summary.totalMileage || 0)],
    ];

    autoTable(doc, {
      startY: 55,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: {
        fillColor: PRIMARY_COLOR,
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
      },
      margin: { left: 14, right: 14 },
    });

    // Vehicle Details Table
    const finalY = doc.lastAutoTable.finalY || 100;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Vehicle Details', 14, finalY + 10);

    const vehicles = data.vehicles || [];
    const tableData = vehicles.map((vehicle) => [
      vehicle.vehicleNumber || 'N/A',
      vehicle.type || 'N/A',
      vehicle.status || 'N/A',
      String(vehicle.totalRides || 0),
      formatDistance(vehicle.monthlyMileage || 0),
      formatDistance(vehicle.totalMileage || 0),
    ]);

    autoTable(doc, {
      startY: finalY + 15,
      head: [['Vehicle', 'Type', 'Status', 'Total Rides', 'Monthly Mileage', 'Total Mileage']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: PRIMARY_COLOR,
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: HEADER_COLOR,
      },
      margin: { left: 14, right: 14 },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${formatDate(new Date())} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(`vehicle-mileage-${month}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

/**
 * Generate Ride History PDF Report
 */
export const generateRideHistoryPDF = (rides, filters = {}) => {
  try {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY_NAME, pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Ride History Report', pageWidth / 2, 25, { align: 'center' });
    
    // Filter info
    let filterText = 'All Rides';
    if (filters.startDate && filters.endDate) {
      filterText = `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`;
    }
    if (filters.status) {
      filterText += ` | Status: ${filters.status}`;
    }
    
    doc.setFontSize(10);
    doc.text(filterText, pageWidth / 2, 33, { align: 'center' });

    // Summary Stats
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Rides: ${rides.length}`, 14, 50);

    const totalDistance = rides.reduce((sum, ride) => {
      const distance = ride.actualDistance || ride.calculatedDistance || 0;
      return sum + distance;
    }, 0);
    doc.text(`Total Distance: ${formatDistance(totalDistance)}`, pageWidth - 14, 50, { align: 'right' });

    // Rides Table
    const tableData = rides.map((ride) => {
      const pickupAddr = ride.pickupLocation?.address || 'N/A';
      const destAddr = ride.destinationLocation?.address || 'N/A';
      
      return [
        `#${ride.rideId || 'N/A'}`,
        ride.requester?.name || 'N/A',
        formatDate(ride.scheduledDate),
        formatTime(ride.scheduledTime),
        pickupAddr.length > 30 ? pickupAddr.substring(0, 27) + '...' : pickupAddr,
        destAddr.length > 30 ? destAddr.substring(0, 27) + '...' : destAddr,
        formatDistance(ride.actualDistance || ride.calculatedDistance || 0),
        ride.assignedDriver?.name || '-',
        ride.status || 'N/A',
      ];
    });

    autoTable(doc, {
      startY: 55,
      head: [['Ride ID', 'Requester', 'Date', 'Time', 'Pickup', 'Destination', 'Distance', 'Driver', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: PRIMARY_COLOR,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7,
      },
      alternateRowStyles: {
        fillColor: HEADER_COLOR,
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 40 },
        5: { cellWidth: 40 },
        6: { cellWidth: 20 },
        7: { cellWidth: 30 },
        8: { cellWidth: 20 },
      },
      margin: { left: 14, right: 14 },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      const now = new Date();
      doc.text(
        `Generated on ${formatDate(now)} at ${formatTime(now)} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    const filename = `ride-history-${formatDate(new Date()).replace(/\//g, '-')}.pdf`;
    doc.save(filename);
    return true;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};









////////////////////////////////////
//Pm Dashboard////////////////

/**
 * Generate PM Monthly Report PDF
 */
export const generatePMReportPDF = (report, month) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY_NAME, pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Project Manager Monthly Report', pageWidth / 2, 27, { align: 'center' });
    
    doc.setFontSize(11);
    doc.text(`Report Period: ${month}`, pageWidth / 2, 37, { align: 'center' });

    // Summary Section
    let yPos = 55;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 14, yPos);

    yPos += 5;
    const summaryData = [
      ['Total Rides', String(report.summary.totalRides || 0)],
      ['Completed Rides', String(report.summary.completedRides || 0)],
      ['Cancelled Rides', String(report.summary.cancelledRides || 0)],
      ['Rejected Rides', String(report.summary.rejectedRides || 0)],
      ['Total Distance', formatDistance(report.summary.totalDistance || 0)],
      ['Average Distance', formatDistance(report.summary.averageDistance || 0)],
      ['Completion Rate', `${report.summary.completionRate || 0}%`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: {
        fillColor: PRIMARY_COLOR,
        fontSize: 11,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 80, halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
    });

    // Long Distance Rides Section
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Long Distance Rides Analysis', 14, yPos);

    yPos += 5;
    const longDistanceData = [
      ['Total Long Distance Rides', String(report.longDistanceRides || 0)],
      ['Long Distance Completion Rate', `${report.longDistanceCompletionRate || 0}%`],
      ['Percentage of Total', `${((report.longDistanceRides / report.summary.totalRides) * 100).toFixed(1)}%`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: longDistanceData,
      theme: 'striped',
      headStyles: {
        fillColor: [251, 191, 36], // Amber-400
        fontSize: 11,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [254, 252, 232], // Amber-50
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 80, halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
    });

    // Status Breakdown
    if (doc.lastAutoTable.finalY + 80 > doc.internal.pageSize.height) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos = doc.lastAutoTable.finalY + 15;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Ride Status Breakdown', 14, yPos);

    yPos += 5;
    const statusData = [
      ['Status', 'Count', 'Percentage'],
      ['Completed', String(report.summary.completedRides), `${((report.summary.completedRides / report.summary.totalRides) * 100).toFixed(1)}%`],
      ['Cancelled', String(report.summary.cancelledRides), `${((report.summary.cancelledRides / report.summary.totalRides) * 100).toFixed(1)}%`],
      ['Rejected', String(report.summary.rejectedRides), `${((report.summary.rejectedRides / report.summary.totalRides) * 100).toFixed(1)}%`],
      ['Pending/Other', String(report.summary.totalRides - report.summary.completedRides - report.summary.cancelledRides - report.summary.rejectedRides), `${(((report.summary.totalRides - report.summary.completedRides - report.summary.cancelledRides - report.summary.rejectedRides) / report.summary.totalRides) * 100).toFixed(1)}%`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [statusData[0]],
      body: statusData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: PRIMARY_COLOR,
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 50, halign: 'center' },
        2: { cellWidth: 60, halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });

    // Key Insights
    if (doc.lastAutoTable.finalY + 50 > doc.internal.pageSize.height) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos = doc.lastAutoTable.finalY + 15;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Insights', 14, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const insights = [
      `• Total of ${report.summary.totalRides} rides managed during this period`,
      `• ${report.longDistanceRides} long-distance rides requiring PM approval (>${PM_APPROVAL_THRESHOLD_KM}km)`,
      `• Overall completion rate: ${report.summary.completionRate}%`,
      `• Average ride distance: ${formatDistance(report.summary.averageDistance)}`,
      `• Total distance covered: ${formatDistance(report.summary.totalDistance)}`,
    ];

    insights.forEach((insight, index) => {
      doc.text(insight, 14, yPos + (index * 7));
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      const now = new Date();
      doc.text(
        `Generated on ${formatDate(now)} at ${formatTime(now)} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(`pm-report-${month}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};